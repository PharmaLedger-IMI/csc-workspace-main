function executeFetch(url, options) {
  // check if we need to add the BASE_URL to the prefix of the url
  if ($$.SSAPP_CONTEXT && $$.SSAPP_CONTEXT.BASE_URL && $$.SSAPP_CONTEXT.SEED && url.indexOf($$.SSAPP_CONTEXT.BASE_URL) !== 0) {
    // BASE_URL ends with / so make sure that url doesn't already start with /
    url = `${$$.SSAPP_CONTEXT.BASE_URL}${url.indexOf('/') === 0 ? url.substr(1) : url}`;
  }

  return fetch(url, options);
}

module.exports = executeFetch;