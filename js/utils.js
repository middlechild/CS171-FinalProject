/* * * * * * * * * * * * * *
*         Utils            *
* * * * * * * * * * * * * */

class Utils {
    constructor() {
        this.colors = {
            "Extinct": ["#c9aef8", "#5c03b0"],
            "Extinct in the wild": ["#edc4f1", "#9f03b0"],
            "Critically endangered": ["#f6bfd0", "#86012a"],
            "Endangered": ["#f5cdc2", "#964112"],
            "Vulnerable": ["#ebf5cf", "#8c9a11"],
            "Least concern": ["#b5f5d8", "#048370"],
            "Data deficient": ["#c6c8c9", "#626565"],
            "rediscovered": ["#6ba9c2", "#136A8A"],
            "extinct": ["#de6388", "#9d0f3a"]
        }

        this.colorsArray = ["#814be0", "#de56ec", "#ee5c89", "#f37655", "#d3f378", "#7ffac2", "#73c7f1"];

        this.risk = {
            "Extinct": 0,
            "Extinct in the wild": 0,
            "Critically endangered": 0,
            "Endangered": 0,
            "Vulnerable": 0,
            "Least concern": 0,
            "Data deficient": 0
        }
    };

    getColors() {
        return this.colors;
    }

    getRiskColorRange() {
        let range = [];
        Object.keys(this.risk).forEach(key => {
            range.push(this.colors[key][0]);
        });
        return range;
    }

    getRisk() {
        return Object.assign({}, this.risk);
    }

    getRiskKeys() {
        let keys = [];
        Object.keys(this.risk).forEach(key => {
            keys.push(key);
        })
        return keys;
    }

    getRiskColorsArray() {
        return this.colorsArray;
    }
}