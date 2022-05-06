import { GeoJSONWithCRS } from './geojson';

/**
 * Section of a survey page
 */
export type SurveyPageSection =
  | SurveyQuestion
  | SurveyTextSection
  | SurveyImageSection
  | SurveyDocumentSection;

/**
 * Question section of a survey page
 */
export type SurveyQuestion =
  | SurveyCheckboxQuestion
  | SurveyRadioQuestion
  | SurveyNumericQuestion
  | SurveyFreeTextQuestion
  | SurveyMapQuestion
  | SurveySortingQuestion
  | SurveySliderQuestion
  | SurveyMatrixQuestion
  | SurveyGroupedCheckboxQuestion;

/**
 * Subquestion type for map questions.
 *
 * Same as SurveyQuestion, but exclude recursive map questions.
 */
export type SurveyMapSubQuestion = Exclude<SurveyQuestion, SurveyMapQuestion>;

/**
 * Common fields for survey page sections
 */
interface CommonSurveyPageSection {
  /**
   * Section ID
   */
  id?: number;
  /**
   * Section title
   */
  title: string;
  /**
   * Additional information related to the section
   */
  info?: string;
  /**
   * Toggler whether the section info should be shown
   */
  showInfo?: boolean;
}

/**
 * Common fields for survey page questions
 */
interface CommonSurveyPageQuestion extends CommonSurveyPageSection {
  /**
   * Is an answer required for the question?
   */
  isRequired: boolean;
}

/**
 * Section file
 */
interface SectionFile {
  fileName: string;
  filePath: string[];
}

/**
 * Checkbox question
 */
export interface SurveyCheckboxQuestion extends CommonSurveyPageQuestion {
  type: 'checkbox';
  options: SectionOption[];
  answerLimits: {
    min?: number;
    max?: number;
  };
  allowCustomAnswer: boolean;
}

/**
 * Radio question
 */
export interface SurveyRadioQuestion extends CommonSurveyPageQuestion {
  type: 'radio';
  options: SectionOption[];
  allowCustomAnswer: boolean;
}

/**
 * Text section
 */
export interface SurveyTextSection extends CommonSurveyPageSection {
  type: 'text';
  body: string;
  bodyColor: string;
}

/**
 * Image section
 */
export interface SurveyImageSection
  extends CommonSurveyPageSection,
    SectionFile {
  type: 'image';
  altText: string;
}

/**
 * Document section
 */
export interface SurveyDocumentSection
  extends CommonSurveyPageSection,
    SectionFile {
  type: 'document';
}

/**
 * Numeric question
 */
export interface SurveyNumericQuestion extends CommonSurveyPageQuestion {
  type: 'numeric';
  minValue: number;
  maxValue: number;
}

/**
 * Free text question
 */
export interface SurveyFreeTextQuestion extends CommonSurveyPageQuestion {
  type: 'free-text';
  maxLength?: number;
}

/**
 * Map question selection type
 */
export type MapQuestionSelectionType = 'point' | 'line' | 'area';

/**
 * Map question
 */
export interface SurveyMapQuestion extends CommonSurveyPageQuestion {
  type: 'map';
  selectionTypes: MapQuestionSelectionType[];
  subQuestions: SurveyMapSubQuestion[];
}

/**
 * Sorting question
 */
export interface SurveySortingQuestion extends CommonSurveyPageQuestion {
  type: 'sorting';
  options: SectionOption[];
}

/**
 * Slider question
 */
export interface SurveySliderQuestion extends CommonSurveyPageQuestion {
  type: 'slider';
  presentationType: 'literal' | 'numeric';
  minValue: number;
  maxValue: number;
  minLabel: LocalizedText;
  maxLabel: LocalizedText;
}

/**
 * Matrix question
 */
export interface SurveyMatrixQuestion extends CommonSurveyPageQuestion {
  type: 'matrix';
  classes: LocalizedText[];
  subjects: LocalizedText[];
  allowEmptyAnswer: boolean;
}

/**
 * Grouped checkbox question
 */
export interface SurveyGroupedCheckboxQuestion
  extends CommonSurveyPageQuestion {
  type: 'grouped-checkbox';
  answerLimits: {
    min?: number;
    max?: number;
  };
  groups: SectionOptionGroup[];
}

/**
 * Type of the survey page sidebar
 */
export type SurveyPageSidebarType = 'none' | 'map' | 'image';

/**
 * Survey page side bar
 */
export interface SurveyPageSidebar {
  /**
   * Type of the sidebar
   */
  type: SurveyPageSidebarType;
  /**
   * IDs of the visible map layers for the page
   */
  mapLayers: number[];
  /**
   * Path of the sidebar image
   */
  imagePath: string[];
  /**
   * Name of the sidebar image
   */
  imageName: string;
  /**
   * Alternative text for the sidebar image
   */
  imageAltText: string;
}

/**
 * Survey page
 */
export interface SurveyPage {
  /**
   * ID of the survey page
   */
  id: number;
  /**
   * Title of the survey page
   */
  title: string;
  /**
   * Side bar definition for the survey page
   */
  sidebar: SurveyPageSidebar;
  /**
   * Page sections
   */
  sections: SurveyPageSection[];
}

export interface Survey {
  /**
   * ID of the survey (unique)
   */
  id: number;
  /**
   * Name of the survey (unique): used to generate the public URL of the survey
   */
  name: string;
  /**
   * Title of the survey
   */
  title: string;
  /**
   * Subtitle of the survey
   */
  subtitle: string;
  /**
   * Author of the survey
   */
  author: string;
  /**
   * Unit under which the author works
   */
  authorUnit: string;
  /**
   * ID of the author (referencing the user table)
   */
  authorId: string;
  /**
   * Array of administrator user IDs
   */
  admins: string[];
  /**
   * URL of the embedded map component
   */
  mapUrl: string;
  /**
   * Date when the survey is planned to start and go public
   */
  startDate: Date;
  /**
   * Date when the survey is planned to end
   */
  endDate: Date;
  /**
   * Is the survey currently published?
   * Computed server-side from startDate and endDate timestamp values - cannot be updated.
   */
  readonly isPublished?: boolean;
  /**
   * Date when the survey was initially created
   */
  createdAt: Date;
  /**
   * Date when the survey was modified last time
   */
  updatedAt: Date;
  /**
   * Survey pages
   */
  pages?: SurveyPage[];
  /**
   * Name of the survey background image
   */
  backgroundImageName?: string;
  /**
   * Path of the survey background image
   */
  backgroundImagePath?: string[];
  /**
   * Thanks page
   */
  thanksPage: {
    /**
     * Title of the thanks page
     */
    title: string;
    /**
     * Text in markdown format
     */
    text: string;
  };
  /**
   * Theme of the survey
   */
  theme: SurveyTheme;
  /**
   * Color of the section titles
   */
  sectionTitleColor: string;
}

/**
 * A single option of a multichoise question
 */
export interface SectionOption {
  /**
   * id of the option
   */
  id?: number;
  /**
   * Localized text field of the option
   */
  text: string;
  /**
   * Localized text field of the option's info
   */
  info?: string;
}

/**
 * A group of options of a grouped checkbox question
 */
export interface SectionOptionGroup {
  /**
   * Group ID
   */
  id: number;
  /**
   * Name of the group
   */
  name: LocalizedText;
  /**
   * Options of the group
   */
  options: SectionOption[];
}

/**
 * Supported language codes
 */
type LanguageCode = 'fi';

/**
 * Type for localization typing
 */
type LocalizedText = {
  [code in LanguageCode]: string;
};

/**
 * Intersected subset of answers for map subquestions.
 */
export type SurveyMapSubQuestionAnswer = AnswerEntry & {
  type: SurveyMapSubQuestion['type'];
};

/**
 * Answer value for a single map question.
 * Contains selected geometry/geometries as GeoJSON and subquestion answer entries.
 */
export interface MapQuestionAnswer {
  selectionType: MapQuestionSelectionType;
  geometry: GeoJSONWithCRS<
    GeoJSON.Feature<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>
  >;
  // Only allow answers to pre-defined types of subquestions
  subQuestionAnswers: SurveyMapSubQuestionAnswer[];
}

/**
 * Submission entry interface
 */
export type AnswerEntry = {
  /**
   * ID of the page section
   */
  sectionId: number;
} & /**
 * Type of the section
 */ (
  | {
      type: 'free-text';
      value: string;
    }
  | {
      type: 'checkbox';
      value: (string | number)[];
    }
  | {
      type: 'radio';
      value: string | number;
    }
  | {
      type: 'numeric';
      value: number;
    }
  | {
      type: 'map';
      value: MapQuestionAnswer[];
    }
  | {
      type: 'sorting';
      value: number[];
    }
  | {
      type: 'slider';
      value: number;
    }
  | {
      type: 'matrix';
      value: string[];
    }
  | {
      type: 'grouped-checkbox';
      value: number[];
    }
);

/**
 * Oskari map layer
 */
export interface MapLayer {
  /**
   * ID of the map layer
   */
  id: number;
  /**
   * Name of the map layer
   */
  name: string;
}

/**
 * File interface
 */
export interface File {
  /**
   * ID of the file
   */
  id: number;
  /**
   * File data as a base64 encoded string
   */
  data: string;
  /**
   * Additional file details
   */
  details?: { [key: string]: any };
  /**
   * Image file name
   */
  fileName: string;
  /**
   * Path of the file in the file hierarchy
   */
  filePath: string;
  /**
   * File mime type
   */
  mimeType: string;
}

/**
 * Image used as the background of the survey landing page
 */
export interface SurveyBackgroundImage extends File {
  /**
   * Image attributions (= who owns the image rights)
   */
  attributions: string;
}

/**
 * Survey theme
 */
export interface SurveyTheme<T extends {} = {}> {
  /**
   * ID of the theme
   */
  id: number;
  /**
   * Optional name for the theme
   */
  name?: string;
  /**
   * Survey configuration object
   */
  data: T;
}
