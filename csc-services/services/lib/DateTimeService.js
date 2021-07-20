const convertStringToLocaleDate = (dateAsString = new Date().toString(), locale = 'sw') => {
  return new Date(dateAsString).toLocaleDateString(locale);
};

const getCurrentDate = () => {
  return new Date();
};

const getCurrentDateAsISOString = () => {
  return getCurrentDate().toISOString();
};

module.exports = {
  convertStringToLocaleDate,
  getCurrentDate,
  getCurrentDateAsISOString,
};
