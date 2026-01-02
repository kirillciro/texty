import { I18n } from "i18n-js";

import cs from "./cs.json";
import da from "./da.json";
import de from "./de.json";
import el from "./el.json";
import en from "./en.json";
import es from "./es.json";
import et from "./et.json";
import fi from "./fi.json";
import fr from "./fr.json";
import hu from "./hu.json";
import it from "./it.json";
import nl from "./nl.json";
import no from "./no.json";
import pl from "./pl.json";
import pt from "./pt.json";
import ro from "./ro.json";
import ru from "./ru.json";
import sv from "./sv.json";
import tr from "./tr.json";
import uk from "./uk.json";

const i18n = new I18n({
  en,
  ru,
  uk,
  de,
  fr,
  es,
  it,
  pt,
  nl,
  pl,
  sv,
  no,
  da,
  fi,
  cs,
  ro,
  el,
  hu,
  tr,
  et,
});

// Fallback if translation missing
i18n.enableFallback = true;

// Default language = English
i18n.locale = "en";

export const setLanguage = (lang: string) => {
  i18n.locale = lang;
};

export const getCurrentLanguage = () => {
  return i18n.locale;
};

export default i18n;
