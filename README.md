### CS171 Final Project

[Rooted in Data: A Visual Exploration of Plant Extinction](https://middlechild.github.io/CS171-FinalProject/)
===================

### Natacha Fernández, Charles Harrington, Evan Wan

For this project we used the d3 and Boostrap libraries.

#### Run project locally:
This project can run on any web server, and does not require special commands or compiling steps —just like any other lab/homework. If WebStorm is available, open the project and right-click on `index.html -> Run.` Internally, WebStorm will start its own web server for serving the project files.

#### Overview of the html, js, and css files:

* `index.html`:
  This file contains the basic HTML layout for our page. External JS and CSS files are loaded.

* `main.js`:
  This file contains JS code that loads data from various data sources and creates instances of the visualizations.

* `comparisonCharts.js`:
  This file contains code that runs the comparison chart for section-5 of the html file. It creates a comparison chart made of boxes that are dynamically updated via a dropdown box.

* `extinctionRateChart.js`:
  This file contains code that runs the bar chart for section-6 of the html file. It creates a horizontal  bar chart that is dynamically updated via buttons.

* `map3d.js`:
  This file contains code that runs the 3d globe for section-8 of the html file. It creates a globe with regional boundaries with colors that can be dynamically updated via a dropdown box.

* `stackedBarchart.js`:
  This file contains code that runs the stacked barchart for section-8 of the html file. It creates a stacked barchart that can be dynamically updated via a dropdown box.

* `topDownBarchart.js`:
  This file contains code that runs the top down barchart for section-9 of the html file. It creates a vertical barchart that also updates a description section via clicking on the bars.

* `mapFlat.js`:
  This file contains code that runs the flat map for section-13 of the html file. It creates a flat world map with regional boundaries with colors that can be dynamically updated via buttons.

* `utils.js`:
  This file contains code for helper functions for the above js files.

* `style.css`:
  This file contains CSS code.

---

#### Overview of data file:
Information about datafiles used and a description of their categories can be found in `docs/data_description.xlsx`

#### Useful Links:
- [Public URL](https://middlechild.github.io/CS171-FinalProject/)
- [Process Book](https://docs.google.com/document/d/1fKJScwvRm_ZZFIwys5lseXKH_AZN5b0TP0vHnneCaZc/)
- [Presentation Video](https://drive.google.com/file/d/1qiifPojThBBSbrJjAq3XQGqWVs2vpc3L/view?usp=sharing)

#### Additional Resources:
- Vector images: [https://svgsilh.com](https://svgsilh.com/image/1302194.html)

- Chelostoma rapunculi image: [https://bugguide.net](https://bugguide.net/node/view/1430409)

- GoeJSON files from the International Working Group on Taxonomic Databases for Plant Sciences (TDWG) were used for the map visualizations. [https://github.com/tdwg/wgsrpd](https://github.com/tdwg/wgsrpd)
