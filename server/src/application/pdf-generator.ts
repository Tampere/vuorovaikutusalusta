import {
  AnswerEntry,
  SectionOption,
  Survey,
  SurveyMapQuestion,
  SurveyMatrixQuestion,
  SurveyPageSection,
} from '@interfaces/survey';
import logger from '@src/logger';
import moment from 'moment';
import PDFDocument from 'pdfkit';
import PdfPrinter from 'pdfmake';
import { Content } from 'pdfmake/interfaces';
import {
  getScreenshots,
  ScreenshotJobData,
  ScreenshotJobReturnData,
} from './screenshot';
import { getFile, getOptionsForSurvey } from './survey';

const fonts = {
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique',
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
  Symbol: {
    normal: 'Symbol',
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats',
  },
};

/**
 * Converts a PDFDocument to a Buffer
 * @param pdf The PDFDocument to convert
 * @returns The Buffer containing the PDF
 */
async function convertPdfToBuffer(pdf: typeof PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdf.on('data', (chunk) => {
      chunks.push(chunk);
    });
    pdf.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    pdf.on('error', reject);
    pdf.end();
  });
}

function prepareMapAnswers(
  survey: Survey,
  answerEntries: AnswerEntry[]
): ScreenshotJobData {
  return answerEntries
    .filter(
      (entry): entry is AnswerEntry & { type: 'map' } => entry.type === 'map'
    )
    .reduce(
      (jobData, entry) => {
        const page = survey.pages.find((page) =>
          page.sections.some((section) => section.id === entry.sectionId)
        );
        return {
          ...jobData,
          answers: [
            ...jobData.answers,
            ...entry.value.map((answer, index) => ({
              sectionId: entry.sectionId,
              index,
              feature: answer.geometry,
              visibleLayerIds: page.sidebar.mapLayers,
              question: page.sections.find(
                (section): section is SurveyMapQuestion =>
                  section.id === entry.sectionId
              ),
            })),
          ],
        };
      },
      {
        mapUrl: survey.mapUrl,
        answers: [],
      } as ScreenshotJobData
    );
}

async function getFrontPage(
  survey: Survey,
  submissionId: number,
  timestamp: Date,
  answerEntries: AnswerEntry[]
): Promise<Content> {
  const image = survey.backgroundImageName
    ? await getFile(survey.backgroundImageName, survey.backgroundImagePath)
    : null;
  const attachmentFileNames = answerEntries
    .filter(
      (entry): entry is AnswerEntry & { type: 'attachment' } =>
        entry.type === 'attachment'
    )
    .map((entry) => entry.value[0]?.fileName)
    .filter(Boolean);
  return [
    // TODO header logo from DB
    image && {
      image: `data:image/png;base64,${image.data.toString('base64')}`,
      width: 498.9,
      margin: [0, 0, 0, 10],
    },
    {
      headlineLevel: 1,
      text: survey.title.toLocaleUpperCase(),
      fontSize: 15,
      bold: true,
      margin: [0, 0, 0, 10],
    },
    {
      headlineLevel: 2,
      text: survey.subtitle,
      fontSize: 12,
      bold: true,
      margin: [0, 0, 0, 10],
    },
    // Add the remaining "info fields" from one array as they have identical styling
    [
      ...(survey.email?.info ?? []).map(
        (item) => `${item.name}: ${item.value}`
      ),
      `Vastauksen tunniste: ${submissionId}`,
      `Tallennusaika: ${moment(timestamp).format('DD.MM.YYYY HH:mm')}`,
      attachmentFileNames.length > 0 &&
        `Liitteet: ${attachmentFileNames.join(', ')}`,
    ]
      .filter(Boolean)
      .map((text) => ({
        text,
        fontSize: 12,
        margin: [0, 0, 0, 10],
      })),
    // TODO footer logo from DB
    { text: '', pageBreak: 'after' },
  ];
}

function getOptionSelectionText(
  value: string | number,
  options: SectionOption[]
) {
  if (typeof value === 'string') {
    return `Joku muu, mikä: ${value}`;
  }
  const option = options.find((option) => option.id === value);
  return option?.text ?? '-';
}

function getContent(
  answerEntry: AnswerEntry,
  sections: SurveyPageSection[],
  screenshots: ScreenshotJobReturnData[],
  options: SectionOption[],
  isSubQuestion = false
): Content[] {
  if (!answerEntry) {
    return null;
  }
  const sectionIndex = sections.findIndex(
    (section) => answerEntry.sectionId === section.id
  );
  const section = sections[sectionIndex];

  const heading: Content = {
    text: `${isSubQuestion ? 'Alikysymys' : 'Kysymys'} #${sectionIndex + 1}: ${
      section.title
    }`,
    style: isSubQuestion ? 'subQuestionTitle' : 'questionTitle',
  };

  const style = isSubQuestion ? 'subQuestionAnswer' : 'answer';

  switch (answerEntry.type) {
    case 'free-text':
      return [
        heading,
        {
          text: answerEntry.value,
          style,
        },
      ];
    case 'radio': {
      return [
        heading,
        {
          text: getOptionSelectionText(answerEntry.value, options),
          style,
        },
      ];
    }
    case 'checkbox': {
      return [
        heading,
        ...answerEntry.value.map((value) => ({
          text: getOptionSelectionText(value, options),
          style,
        })),
      ];
    }
    case 'grouped-checkbox': {
      return [
        heading,
        ...answerEntry.value.map((value) => ({
          text: getOptionSelectionText(value, options),
          style,
        })),
      ];
    }
    case 'numeric':
    case 'slider': {
      return [
        heading,
        {
          text: answerEntry.value == null ? '-' : String(answerEntry.value),
          style,
        },
      ];
    }
    case 'matrix': {
      const question = section as SurveyMatrixQuestion;
      return [
        heading,
        {
          ul: question.subjects.map((subject, index) => ({
            text: `${subject.fi}: ${
              answerEntry.value[index] === '-1'
                ? 'En osaa sanoa'
                : answerEntry.value[index] == null
                ? '-'
                : question.classes[Number(answerEntry.value[index])]?.fi ?? '-'
            }`,
            style,
          })),
        },
      ];
    }
    case 'sorting': {
      return [
        heading,
        {
          ol: answerEntry.value.map((value) => ({
            text: `${getOptionSelectionText(value, options)}`,
            style,
          })),
        },
      ];
    }
    case 'map': {
      if (!answerEntry.value.length) {
        return [heading, { text: '-', style }];
      }
      return [
        heading,
        ...answerEntry.value.map((answer, index) => {
          const screenshot = screenshots.find(
            (screenshot) =>
              screenshot.sectionId === answerEntry.sectionId &&
              screenshot.index === index
          );
          return [
            {
              image:
                'data:image/png;base64,' + screenshot.image.toString('base64'),
              width: 300,
              style,
            },
            ...answer.subQuestionAnswers.map((subQuestionAnswer) => {
              const mapQuestion = section as SurveyMapQuestion;
              return getContent(
                subQuestionAnswer,
                mapQuestion.subQuestions,
                [],
                options,
                true
              );
            }),
          ];
        }),
      ];
    }
    // Unlisted types are ignored in the PDf
    default:
      return null;
  }
}

/**
 * Generates a PDF for a single submission.
 * @param survey Survey
 * @param submission Info about the newly created submission
 * @param answerEntries Answer entries for the submission
 * @returns
 */
export async function generatePdf(
  survey: Survey,
  submission: { id: number; timestamp: Date },
  answerEntries: AnswerEntry[]
) {
  const start = Date.now();
  const options = await getOptionsForSurvey(survey.id);

  const sections = survey.pages.reduce(
    (sections, page) => [...sections, ...page.sections],
    [] as SurveyPageSection[]
  );
  const screenshotJobData = prepareMapAnswers(survey, answerEntries);
  const screenshots = await getScreenshots(screenshotJobData);

  logger.debug(
    `Fetched ${screenshots.length} screenshots in ${Date.now() - start}ms`
  );

  const content: Content = [
    await getFrontPage(
      survey,
      submission.id,
      submission.timestamp,
      answerEntries
    ),
    ...sections.map((section) =>
      getContent(
        answerEntries.find((entry) => entry.sectionId === section.id),
        sections,
        screenshots,
        options
      )
    ),
  ];

  const document = new PdfPrinter(fonts).createPdfKitDocument({
    content,
    defaultStyle: {
      font: 'Helvetica',
    },
    styles: {
      questionTitle: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      answer: {
        fontSize: 12,
        margin: [0, 0, 0, 20],
      },
      subQuestionTitle: {
        fontSize: 14,
        bold: true,
        margin: [10, 0, 0, 10],
      },
      subQuestionAnswer: {
        margin: [10, 0, 0, 20],
      },
    },
  });
  return convertPdfToBuffer(document);
}
