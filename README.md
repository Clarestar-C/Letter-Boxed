**Overview**

A dynamic web implementation of the classic Letter Boxed word puzzle, built with React and Vite. It features interactive SVG vector line drawing between side nodes, mobile touch navigation, and an algorithmic solver for path validation and solution finding.

**Key Features**

* **Interactive Canvas & Line Engine:** Dynamic SVG pathing that visually connects selected letters across the 4-sided board as you spell out words.
* **Algorithmic Solver (DFS):** Built-in Depth-First Search solver that analyzes letter combinations, validates solutions, and sets difficulty targets.
* **Responsive & Mobile-Optimized:** Full touch-event support with interactive node physics, smooth canvas rendering, and custom toast notifications.
* **Dictionary Integration:** Real-time word validation using an English dictionary dataset.

**Current Work in Progress / Roadmap**

* **Board Generation Performance:** Optimizing the board-generation pipeline to significantly reduce algorithm execution time and serve newly generated puzzles faster.
