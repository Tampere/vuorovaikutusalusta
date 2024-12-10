import { Page } from '@playwright/test';

export interface SurveyParams {
  title: string;
  subtitle: string;
  urlName: string;
  author: string;
  startDate: string; // DD.MM.YYYY hh:mm
  endDate: string; // DD.MM.YYYY hh:mm
}

export interface RadioQuestionParams {
  pageName: string;
  title: string;
  isRequired?: boolean;
  answerOptions: string[];
  allowCustom?: boolean;
  additionalInfo?: string;
}

export class SurveyEditPage {
  private _page: Page;
  private _surveyId: string | null;

  constructor(page: Page, surveyId?: string) {
    this._page = page;
    this._surveyId = surveyId ?? null;
  }

  get page() {
    return this._page;
  }

  get surveyId() {
    return this._surveyId;
  }

  async goto() {
    if (this._surveyId) {
      await this._page.goto(
        `http://localhost:8080/admin/kyselyt/${this._surveyId}`,
      );
    } else {
      await this._page.goto('http://localhost:8080/admin');
      await this._page.getByRole('button', { name: 'Uusi kysely' }).click();
      await this._page.waitForURL(
        'http://localhost:8080/admin/kyselyt/*/perustiedot',
      );
      const urlParts = this._page.url().split('/');
      const lastElement = urlParts[urlParts.length - 1];
      this._surveyId = lastElement;
    }
  }

  async fillBasicInfo(params: SurveyParams) {
    await this._page.getByRole('link', { name: 'Kyselyn perustiedot' }).click();
    await this._page.getByLabel('Kyselyn otsikko *').fill(params.title);
    await this._page.getByLabel('Kyselyn aliotsikko').fill(params.subtitle);
    await this._page.getByLabel('Kyselyn nimi *').fill(params.urlName);
    await this._page
      .getByLabel('Kyselyn laatija/yhteyshenkil')
      .fill(params.author);
    await this._page.getByLabel('Alkamisaika').fill(params.startDate);
    await this._page.getByLabel('Loppumisaika').fill(params.endDate);
    await this._page.getByLabel('save-changes').click();
  }

  async goToPage(pageName: string) {
    await this._page.getByRole('link', { name: pageName }).click();
  }

  async renamePage(oldName: string, newName: string) {
    await this.goToPage(oldName);
    await this._page.getByLabel('Sivun nimi *').fill(newName);
  }

  async createRadioQuestion(radioQuestionParams: RadioQuestionParams) {
    await this.goToPage(radioQuestionParams.pageName);
    await this._page.getByLabel('add-radio-question').click();
    await this._page.getByLabel('Otsikko').fill(radioQuestionParams.title);
    if (radioQuestionParams.isRequired) {
      await this._page
        .getByRole('checkbox', { name: 'Vastaus pakollinen' })
        .check();
    }

    for (const [idx, option] of radioQuestionParams.answerOptions.entries()) {
      if (idx > 0) await this._page.getByLabel('add-question-option').click();
      await this._page
        .getByTestId(`radio-input-option-${idx}`)
        .locator('textarea')
        .nth(0)
        .fill(option);
    }
    if (radioQuestionParams.allowCustom) {
      await this._page.getByLabel('Salli “Jokin muu, mikä?” -').check();
    }
    if (radioQuestionParams.additionalInfo) {
      await this._page.getByLabel('Anna lisätietoja kysymykseen').check();
      await this._page
        .getByLabel('rdw-editor')
        .locator('div')
        .nth(2)
        .fill(radioQuestionParams.additionalInfo);
    }
    await this._page.getByLabel('save-changes').click();
  }
}
