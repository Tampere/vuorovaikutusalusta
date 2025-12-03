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
 * Survey page section which can have follow-up sections
 */
export type SurveyFollowUpSectionParent = Extract<
  SurveyPageSection,
  { type: 'numeric' | 'slider' | 'checkbox' | 'radio' }
>;

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
  | SurveyMultiMatrixQuestion
  | SurveyMatrixQuestion
  | SurveyGroupedCheckboxQuestion
  | SurveyAttachmentQuestion
  | SurveyPersonalInfoQuestion
  | SurveyCategorizedCheckboxQuestion;

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
  title: LocalizedText;
  /**
   * Additional information related to the section
   */
  info?: LocalizedText;
  /**
   * Toggler whether the section info should be shown
   */
  showInfo?: boolean;
  /**
   * Follow-up sections
   */
  followUpSections?: SurveyFollowUpSection[];
}

type SurveyFollowUpSection = SurveyPageSection & {
  conditions: Conditions;
};

type SurveyFollowUpQuestion = SurveyQuestion & {
  conditions: Conditions;
};

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
 * File attachment answers
 */
interface FileAnswer {
  fileName: string;
  fileString: string;
}

/**
 * Personal info anwers
 */
interface PersonalInfoAnswer {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  custom: (string | null)[];
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
  displaySelection: boolean;
}

/**
 * Personal info question
 */
export interface SurveyPersonalInfoQuestion extends CommonSurveyPageQuestion {
  type: 'personal-info';
  askName: boolean;
  askEmail: boolean;
  askPhone: boolean;
  askAddress: boolean;
  customQuestions: {
    ask: boolean;
    label?: LocalizedText;
  }[];
}

/**
 * Radio question
 */
export interface SurveyRadioQuestion extends CommonSurveyPageQuestion {
  type: 'radio';
  options: SectionOption[];
  allowCustomAnswer: boolean;
  displaySelection: boolean;
}

/**
 * Text section
 */
export interface SurveyTextSection extends CommonSurveyPageSection {
  type: 'text';
  body: LocalizedText;
  bodyColor: string;
}

/**
 * Image section
 */
export interface SurveyImageSection
  extends CommonSurveyPageSection,
    SectionFile {
  type: 'image';
  altText: LocalizedText;
  attributions: LocalizedText;
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
 * Stroke style of map features
 */
export type FeatureStrokeStyle = 'solid' | 'dashed' | 'dotted';

/**
 * Map question
 */
export interface SurveyMapQuestion extends CommonSurveyPageQuestion {
  type: 'map';
  selectionTypes: MapQuestionSelectionType[];
  featureStyles: {
    point: {
      /**
       * Marker icon in SVG format
       */
      markerIcon: string;
    };
    line: { strokeStyle: FeatureStrokeStyle; strokeColor: string };
    area: {
      strokeStyle: FeatureStrokeStyle;
      strokeColor: string;
    };
  };
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
  subjects: (LocalizedText & { id?: string })[]; // Id is used for sorting purposes
  allowEmptyAnswer: boolean;
}

/**
 * Multiple choice matrix question
 */

export interface SurveyMultiMatrixQuestion extends CommonSurveyPageQuestion {
  type: 'multi-matrix';
  classes: LocalizedText[];
  subjects: (LocalizedText & { id?: string })[]; // Id is used for sorting purposes
  allowEmptyAnswer: boolean;
  answerLimits: {
    min?: number;
    max?: number;
  };
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
 * Categorized checkbox question
 */
export interface SurveyCategorizedCheckboxQuestion
  extends CommonSurveyPageQuestion {
  type: 'categorized-checkbox';
  answerLimits: {
    min?: number;
    max?: number;
  };
  categoryGroups: SectionOptionCategoryGroup[];
  options: SectionOption[];
}

/**
 * Attachment "question"
 */
export interface SurveyAttachmentQuestion extends CommonSurveyPageQuestion {
  type: 'attachment';
}

/**
 * Type of the survey page sidebar
 */
export type SurveyPageSidebarType = 'none' | 'map' | 'image';
/**
 * Survey page sidebar image size
 */
export type SurveyPageSidebarImageSize = 'original' | 'fitted';

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
   * Geometry for the default map view
   */
  defaultMapView: Geometry;
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
  imageAltText: LocalizedText;
  /**
   * Information how the picture is displayed
   */
  imageSize: SurveyPageSidebarImageSize;
  /**
   * Attributions for sidebar image
   */
  imageAttributions: LocalizedText;
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
  title: LocalizedText;
  /**
   * Side bar definition for the survey page
   */
  sidebar: SurveyPageSidebar;
  /**
   * Page sections
   */
  sections: SurveyPageSection[];
  /**
   * Conditions to display the page in the survey
   */
  conditions?: SurveyPageConditions;

  /**
   * Are conditional page conditions fulfilled
   */
  isVisible?: boolean;
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
  title: LocalizedText;
  /**
   * Subtitle of the survey
   */
  subtitle: LocalizedText;
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
   * Publish a "dummy" test survey on save?
   */
  allowTestSurvey: boolean;
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
    title: LocalizedText;
    /**
     * Text in markdown format
     */
    text: LocalizedText;
    /**
     * Name of the thanks page image
     */
    imageName?: string;
    /**
     * Path of the thanks page image
     */
    imagePath?: string[];
  };
  /**
   * Theme of the survey
   */
  theme: SurveyTheme;
  /**
   * Color of the section titles
   */
  sectionTitleColor: string;
  /**
   * Mail configurations
   */
  email: {
    /**
     * Is email reporting for single submissions enabled?
     */
    enabled: boolean;
    /**
     * Fixed recipient addresses for the automatic sending
     */
    autoSendTo: string[];
    /**
     * Subject of the email
     */
    subject: LocalizedText;
    /**
     * Body of the email
     */
    body: LocalizedText;
    /**
     * Optional free-form information to be shown on the front page of the report
     */
    info: SurveyEmailInfoItem[];
    /**
     * Should sensitive data be included in email
     */
    includePersonalInfo: boolean;
  };
  /**
   * Should the survey be able to be saved as unfinished
   */
  allowSavingUnfinished?: boolean;
  /**
   * Allow publishing surveys with different languages
   */
  localisationEnabled: boolean;
  /**
   * Should a link for the privacy statement be displayed
   */
  displayPrivacyStatement: boolean;
  /**
   * Number of submissions for the survey
   */
  submissionCount: number;
  /**
   * Is email registration required for submissions?
   */
  emailRegistrationRequired: boolean;
  /**
   * Should background image attributions be shown?
   */
  displayBackgroundAttributions: boolean;
  /**
   * Should thanks image attributions be shown?
   */
  displayThanksAttributions: boolean;
}

/**
 * A single option for variety of questions
 */
export interface SectionOption {
  /**
   * Draft ID of the option which is used when Id is not yet available. Used for sorting purposes but not saved to the database.
   */
  draftId?: string;
  /**
   * Id of the option
   */
  id?: number;
  /**
   * Localized text field of the option
   */
  text: LocalizedText;
  /**
   * Localized text field of the option's info
   */
  info?: LocalizedText;
  /**
   * Categories where the option belongs to
   */
  categories?: SectionOptionCategory['id'][];
}

/**
 * A single category for checkbox question's options
 */
export interface SectionOptionCategory {
  /**
   * Id of the category
   */
  id: string;
  /**
   * Localized name of the category
   */
  name: LocalizedText;
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
 * A group of categories of a categorized checkbox question
 */
export interface SectionOptionCategoryGroup {
  /**
   * Group ID
   */
  id: string;
  /**
   * Index of the group in the survey page section
   */
  idx: number;
  /**
   * Name of the group
   */
  name: LocalizedText;
  /**
   * Categories of the group
   */
  categories: SectionOptionCategory[];
}

/**
 * Supported language codes
 */
type LanguageCode = 'fi' | 'en';

/**
 * Type for localization typing
 */
type LocalizedText = Record<LanguageCode, string>;

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
  mapLayers: number[];
  geometry: GeoJSONWithCRS<
    GeoJSON.Feature<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>
  >;
  // Only allow answers to pre-defined types of subquestions
  subQuestionAnswers: SurveyMapSubQuestionAnswer[];
}

interface AnswerEntryByType {
  'free-text': {
    type: 'free-text';
    value: string;
  };
  checkbox: {
    type: 'checkbox';
    value: (string | number)[];
  };
  radio: {
    type: 'radio';
    value: string | number;
  };
  numeric: {
    type: 'numeric';
    value: number;
  };
  map: {
    type: 'map';
    value: MapQuestionAnswer[];
  };
  sorting: {
    type: 'sorting';
    value: number[];
  };
  slider: {
    type: 'slider';
    value: number;
  };
  matrix: {
    type: 'matrix';
    value: string[];
  };
  'multi-matrix': {
    type: 'multi-matrix';
    value: string[][];
  };
  'grouped-checkbox': {
    type: 'grouped-checkbox';
    value: number[];
  };
  'categorized-checkbox': {
    type: 'categorized-checkbox';
    value: number[];
    filters: string[];
  };
  attachment: {
    type: 'attachment';
    value: FileAnswer[];
  };
  'personal-info': {
    type: 'personal-info';
    value: PersonalInfoAnswer;
  };
}

type AnswerEntryType = keyof AnswerEntryByType;

/**
 * Submission entry interface
 */
export type AnswerEntry<T extends AnswerEntryType = AnswerEntryType> = {
  sectionId: number;
} & AnswerEntryByType[T];

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
  data: Buffer;
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
  filePath: string[];
  /**
   * File mime type
   */
  mimeType: string;
}

/**
 * Image used as the background of the survey landing page or in the thank you page
 */
export interface ImageFile extends File {
  /**
   * Image attributions (= who owns the image rights)
   */
  attributions: string;
  /**
   * Alternative text for the picture entered by the user
   */
  altText: string;
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

/**
 * Info about the submitter
 */
export interface SubmissionInfo {
  /**
   * Email address
   */
  email: string;
}

/**
 * Map marker icon
 */
export interface MapMarkerIcon {
  id: number;
  name: string;
  svg: string;
}

/**
 * Map stroke color
 */
export interface MapStrokeColor {
  name: string;
  value: string;
}

/**
 * A single item in survey email info
 */
export interface SurveyEmailInfoItem {
  name: LocalizedText;
  value: LocalizedText;
}

/**
 * Submission
 */
export interface Submission {
  id: number;
  timestamp: Date;
  answerEntries?: AnswerEntry[];
}

export type ImageType =
  | 'backgroundImage'
  | 'thanksPageImage'
  | 'generalNotifications';

/**
 * Conditions to display follow-up section
 */

export interface Conditions {
  equals: number[];
  lessThan: number[];
  greaterThan: number[];
}

export type SurveyPageConditions = Record<SurveyPageSection['id'], Conditions>;

/**
 * Survey registration
 */
export interface SurveyRegistration {
  id: string;
  surveyId: number;
  email: string;
  hasSubmission: boolean;
}
