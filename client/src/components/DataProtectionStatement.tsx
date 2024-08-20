import { React } from 'react';

export function DataProtectionStatement() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        width: '60%',
        margin: '36px',
      }}
    >
      <h1> Tietosuoja- ja tiedonhallintaselote </h1>
      <p>
        Tämä tietosuoja- ja tiedonhallintaseloste koskee Ubigu Oy:n tarjoamaa
        Kartalla -sovellusta.
      </p>
      <h2>1. Rekisterinpitäjä</h2>
      <p> Ubigu Oy</p>

      <h2>2. Henkilötiedot</h2>
      <p>
        Web-sovellus ei kerää käyttäjien henkilötietoja automaattisesti.
        Henkilötietoja pyydetään ja käsitellään vain käyttäjän antaessa ne
        erikseen luvan esimerkiksi yhteydenottolomakkeen kautta. Tällöin
        kerättävät tiedot voivat sisältää nimen, sähköpostiosoitteen ja viestin
        sisällön.
      </p>

      <h2>3. Tietojen käyttötarkoitus</h2>
      <p>
        Kerätyt henkilötiedot käytetään ainoastaan käyttäjän yhteydenottopyynnön
        käsittelyyn. Tietoja ei käytetä markkinointiin eikä jaeta kolmansille
        osapuolille.
      </p>

      <h2>4. Tietojen säilytys ja suojaus</h2>
      <p>
        Henkilötietoja säilytetään vain niin kauan kuin on tarpeen
        yhteydenottopyynnön käsittelyyn. Tietoja suojataan asianmukaisesti
        teknisin ja organisatorisin toimenpitein.
      </p>

      <h2>5. Käyttäjän oikeudet</h2>
      <p>
        Käyttäjällä on oikeus tarkastaa häntä koskevat henkilötiedot, pyytää
        niiden oikaisua tai poistoa sekä vastustaa tietojen käsittelyä. Pyynnöt
        tulee lähettää web-sovelluksen ylläpitäjälle.
      </p>

      <h2>6. Muutokset tietosuojaselosteeseen</h2>
      <p>
        Web-sovelluksen ylläpitäjä pidättää oikeuden tehdä muutoksia tähän
        tietosuojaselosteeseen. Muutoksista ilmoitetaan web-sovelluksen
        sivuilla.
      </p>
    </div>
  );
}
