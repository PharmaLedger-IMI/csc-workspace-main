const convertStringToLocaleDate = (dateAsString = new Date().toString(), locale = 'sw') => {
    return new Date(dateAsString).toLocaleDateString(locale);
}

const getCurrentDate = () => {
    return new Date();
}

const getCurrentDateAsISOString = () => {
    return getCurrentDate().toISOString();
}

export default {
    convertStringToLocaleDate,
    getCurrentDate,
    getCurrentDateAsISOString
};