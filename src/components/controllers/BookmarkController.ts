import { Vector3 } from "three";
import Bookmark from "../../types/Bookmark"
import CameraPosition from "../../types/CameraPosition";
import MainController from "./MainController";

const bookmarks = [
    new Bookmark('Entrée du 19', new CameraPosition(new Vector3(841907.9, 6517787.6, 169.2), new Vector3(841905.9, 6517796.4, 168.9), new Vector3(0.1,-1.11,-0.0))),
    new Bookmark('Dans le 19', new CameraPosition(new Vector3(841907.60,6517804.2,169.4), new Vector3(841904.9,6517800.2,168.7), new Vector3(-0.30,0.22,-0.01))),
    new Bookmark('Vue sur le garage du 19', new CameraPosition(new Vector3(841860.4,6517792.9,191.21), new Vector3(841901.2,6517810.40,169.8), new Vector3(0.2,-3.60,-0.1))),
    new Bookmark('Arrière du 19', new CameraPosition(new Vector3(841966.6,6517864.2,190.9), new Vector3(841913.4,6517812.32,169.1), new Vector3(2.0,-8.2,-0.4))),
    new Bookmark('Fondations du 19', new CameraPosition(new Vector3(841871.8,6517798.5,155.6), new Vector3(841901.7,6517804.9,165.52), new Vector3(1.7,-0.1,-0.0))),
    new Bookmark('Le 19 et ses environs', new CameraPosition(new Vector3(841744.9,6517718.90,283.60), new Vector3(841901.61,6517800.2,179.1), new Vector3(6.7,-19.8,-1.0))),
    new Bookmark('Le 19 et le paysage', new CameraPosition(new Vector3(841969.4,6517752.1,203.3), new Vector3(841866.8,6517820.7,185.5), new Vector3(0.40,-7.2,-0.21))),
    new Bookmark('Entrée du tunnel de Fourvière', new CameraPosition(new Vector3(842319.2,6518423.6,982.2), new Vector3(841467.6,6518689.5,204.6), new Vector3(-133.00,3.60,-7.50))),
    new Bookmark('Vue Gerland / presqu\'île ZAE', new CameraPosition(new Vector3(843055.3,6514043.62,1742.61), new Vector3(842330.1,6516692.81,165.21), new Vector3(-290.32,64.6,-13.9))),
    new Bookmark('Montée des eaux', new CameraPosition(new Vector3(842174.9,6514276.1,6860.90), new Vector3(842286.9,6518559.1,133.9), new Vector3(-77.9,165.71,-2.5))),
]

function getBookmarks()  {
    return bookmarks;
}

function addBookmarkFromCurrentPosition(name: string) {
    if (controller) {
        controller.addBookmarkFromCurrentView(name);
    }
}

function addBookmark(bookmark: Bookmark) {
    if (controller) {
        controller.addBookmark(bookmark);
    }
}

let controller: BookmarkController;

MainController.onInit(ctrl => {
    controller = new BookmarkController(ctrl);
});

class BookmarkController {
    private readonly mainController: MainController;

    constructor(mainController: MainController) {
        this.mainController = mainController;

        for (const bm of bookmarks) {
            bm.addEventListener('delete', () => this.deleteBookmark(bm));
            bm.addEventListener('goto', () => this.goTo(bm));
        }
    }

    goTo(bookmark: Bookmark) {
        if (bookmark.camera) {
            this.mainController.camera.setCamera(bookmark.camera);
        }
    }

    addBookmark(bookmark: Bookmark) {
        bookmark.addEventListener('delete', () => this.deleteBookmark(bookmark));
        bookmark.addEventListener('goto', () => this.goTo(bookmark));
        bookmarks.push(bookmark);
    }

    addBookmarkFromCurrentView(name: string) {
        const cameraPosition = this.mainController.camera.getCameraPosition();
        const bookmark = new Bookmark(name, cameraPosition);
        this.addBookmark(bookmark);
    }

    deleteBookmark(bookmark: Bookmark) {
        const index = bookmarks.indexOf(bookmark);
        bookmarks.splice(index, 1);
    }
}

export default {
    getBookmarks,
    addBookmarkFromCurrentPosition,
    addBookmark,
}