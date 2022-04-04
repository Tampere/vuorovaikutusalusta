import { GeoJSONWithCRS } from './geojson';

/**
 * Section of a survey page
 */
export type SurveyPageSection = SurveyQuestion | SurveyTextSection;

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
  | SurveyMatrixQuestion;

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
}

/**
 * Numeric question
 */
export interface SurveyNumericQuestion extends CommonSurveyPageQuestion {
  type: 'numeric';
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
   * IDs of the visible map layers for the page
   */
  mapLayers: number[];
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
   * ID of the survey background image
   */
  backgroundImageId?: number;
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
 * Image used as the background of the survey landing page
 */
export interface SurveyBackgroundImage {
  /**
   * ID of the image
   */
  id: number;
  /**
   * Image data as a base64 encoded string
   */
  data: string;
  /**
   * Image attributions (= who owns the image rights)
   */
  attributions: string;
  /**
   * Image file name
   */
  fileName: string;
  /**
   * Image file format (e.g. .png, .jpeg)
   */
  fileFormat: string;
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
