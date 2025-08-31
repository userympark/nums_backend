import Theme from "../models/Theme";

export async function listAllThemesService() {
  const themes = await Theme.findAll({ order: [["theme_id", "ASC"]] });
  return themes;
}

