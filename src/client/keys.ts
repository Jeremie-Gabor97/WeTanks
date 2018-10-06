import { Dictionary } from 'lodash';

const keyDictionary = {};

class KeyManager {
    keys: Dictionary<boolean>;

    constructor() {
        this.keys = {};
    }

    keyDown(key: string) {
        let initial = true;
        if (this.keys[key]) {
            initial = false;
        }
        this.keys[key] = true;
        return initial;
    }

    keyUp(key: string) {
        this.keys[key] = false;
    }
}

export default KeyManager;