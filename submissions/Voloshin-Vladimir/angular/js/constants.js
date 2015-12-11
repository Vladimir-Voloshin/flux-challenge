'use strict';

/* Directives */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

angular.module("mainSection")
    .constant("appConstants", {
        "BASE_URL":             'http://localhost:3000/dark-jedis/',
        "INITIAL_ID":           3616,
        "JEDI_MOVED_TO_PLANET": 4,
        "JEDI_POPULATE_LIST":   1,
        "JEDI_SCROLLUP":        2,
        "JEDI_SCROLLDOWN":      3,
        "ROWS_AMOUNT":          5,
        "SCROLL_PER_CLICK":     2
});