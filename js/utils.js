/* * * * * * * * * * * * * *
*         Utils            *
* * * * * * * * * * * * * */

class Utils {
    constructor() {
        this.colors = {
            "Extinct": ["#f4c3f5", "#875088"],
            "Extinct in the wild": ["#fadfed", "#91687d"],
            "Critically endangered": ["#f6a89f", "#dc5041"],
            "Endangered": ["#fadab6", "#ee9a3e"],
            "Vulnerable": ["#ddf8b0", "#6b9423"],
            "Least concern": ["#cafaee", "#388170"],
            "Data deficient": ["#eeeded", "#545454"],
            "rediscovered": ["#abd5e7", "#136A8A"],
            "extinct": ["#f6c9d7", "#af0a3c"]
        }

        this.solidColors = {
            "Extinct": "#bc80bd",
            "Extinct in the wild": "#fccde5",
            "Critically endangered": "#fb8072",
            "Endangered": "#fdb462",
            "Vulnerable": "#b3de69",
            "Least concern": "#8dd3c2",
            "Data deficient": "#d9d9d9"
        }

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

    getSolidColors() {
        return this.solidColors;
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
}
