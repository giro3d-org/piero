import Bookmark from "../../types/Bookmark"

const bookmarks = [
    new Bookmark('Entrée du 19', 'TODO'),
    new Bookmark('Dans le 19', 'TODO'),
    new Bookmark('Vue sur le garage du 19', 'TODO'),
    new Bookmark('Arrière du 19', 'TODO'),
    new Bookmark('Fondations du 19', 'TODO'),
    new Bookmark('Le 19 et ses environs', 'TODO'),
    new Bookmark('Le 19 et le paysage', 'TODO'),
    new Bookmark('Entrée du tunnel de Fourvière', 'TODO'),
    new Bookmark('Vue Gerland / presqu\'île ZAE', 'TODO'),
    new Bookmark('Montée des eaux', 'TODO'),
]

function getBookmarks()  {
    return bookmarks;
}

/**
 * @param {Bookmark} bookmark
 */
function deleteBookmark(bookmark) {
    const index = bookmarks.indexOf(bookmark);
    bookmarks.splice(index, 1);
}

export default {
    getBookmarks,
    deleteBookmark,
}