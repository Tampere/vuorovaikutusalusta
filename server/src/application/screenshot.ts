import { GeoJSONWithCRS } from '@interfaces/geojson';
import { Feature, LineString, Point, Polygon } from 'geojson';
import { Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';

/**
 * Oskari needs to be declared, because it is available as a global variable inside
 * Puppeteer's evaluation context.
 */
declare const Oskari: any;

let cluster: Cluster<ScreenshotJobData, ScreenshotJobReturnData[]>;

export interface ScreenshotJobData {
  mapUrl: string;
  answers?: {
    sectionId: number;
    index: number;
    feature: GeoJSONWithCRS<Feature<Point | LineString | Polygon>>;
    visibleLayerIds: number[];
  }[];
}

export interface ScreenshotJobReturnData {
  sectionId: number;
  index: number;
  image: Buffer;
}

async function generateScreenshots({
  page,
  data,
}: {
  page: Page;
  data: ScreenshotJobData;
}) {
  const start = Date.now();
  const { mapUrl, answers } = data;
  const returnData: ScreenshotJobReturnData[] = [];

  page.setViewport({ width: 800, height: 600 });
  await page.goto(mapUrl, { waitUntil: 'networkidle0' });

  // Open the index map if enabled
  await page.evaluate(() => {
    document.querySelector<HTMLDivElement>('.indexmapToggle')?.click();
  });
  await page.waitForNetworkIdle();

  for (const answer of answers) {
    // Prepare the window for the next screenshot
    await page.evaluate(
      ({ visibleLayerIds, feature }) => {
        const sandbox = Oskari.getSandbox();

        sandbox
          .getMap()
          .getLayers()
          .map((layer) => layer.getId())
          .forEach((layerId) => {
            sandbox.postRequestByName(
              'MapModulePlugin.MapLayerVisibilityRequest',
              [layerId, visibleLayerIds.includes(layerId)]
            );
          });

        sandbox.postRequestByName('MapModulePlugin.AddFeaturesToMapRequest', [
          { type: 'FeatureCollection', features: [feature] },
          {
            clearPrevious: true,
            featureStyle: {
              stroke: {
                color: 'rgba(0,0,0,0.5)',
                width: 10,
              },
            },
          },
        ]);
        sandbox.postRequestByName('MapModulePlugin.ZoomToFeaturesRequest', []);
      },
      {
        visibleLayerIds: answer.visibleLayerIds,
        feature: answer.feature as any,
      }
    );
    await page.waitForNetworkIdle();
    returnData.push({
      sectionId: answer.sectionId,
      index: answer.index,
      image: (await page.screenshot({
        type: 'png',
        fullPage: true,
      })) as Buffer,
    });
  }

  console.log(
    `Took all ${answers.length} screenshots in ${Date.now() - start}ms`
  );

  return returnData;
}

/**
 * Initializes Puppeteer cluster for taking screenshots of the map answer entries.
 * @returns
 */
export async function initializePuppeteerCluster() {
  if (cluster) {
    return;
  }

  // How many puppeteer instances to use?
  const maxConcurrency = process.env.PUPPETEER_CLUSTER_MAX_CONCURRENCY
    ? Number(process.env.PUPPETEER_CLUSTER_MAX_CONCURRENCY)
    : 2;

  // Launch and assign the cluster
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency,
    puppeteerOptions: {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
      ],
    },
  });
  // Assign the screenshot task to the cluster
  await cluster.task(generateScreenshots);
}

/**
 * Get screenshots for given details.
 * @param jobData Job data
 * @returns Screenshot images
 */
export async function getScreenshots(jobData: ScreenshotJobData) {
  if (!cluster) {
    throw new Error('Puppeteer cluster not initialized');
  }
  const images = await cluster.execute(jobData);
  return images;
}
