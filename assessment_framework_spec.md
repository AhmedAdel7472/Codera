# AI Digital Placement Assessment Framework Specification

## Executive Summary

The **AI Digital Placement Assessment** is a standardized, game-based, AI-driven evaluation framework designed to determine a student's technical readiness, cognitive aptitude, and foundational skills for technology education (programming, robotics, and engineering). 

By establishing a **standardized scoring model** prior to AI generation and adaptive difficulty scaling, the assessment guarantees equal difficulty, objective measurement, and consistent placement across all generated evaluation sessions.

---

## Assessment Parameters & Structure

- **Assessment Type:** AI-Generated Computerized Adaptive Testing (CAT)
- **Target Duration:** 25–30 Minutes
- **Evaluation Mechanism:** Real-Time Telemetry & AI-Assisted Qualitative Analysis
- **Maximum Assessment Score:** 100 Points
- **Total Assessment Items:** **20 Questions / Interactive Tasks**

---

## Domain Allocation Matrix & Question Distribution

| Domain | Weight (%) | Maximum Points | Question Allocation | Time Allocation |
| :--- | :---: | :---: | :---: | :---: |
| **1. Cognitive Ability** | 25% | 25 Pts | **5 Questions** (5 pts/item) | 6–7 Mins |
| **2. Functional Skills** | 25% | 25 Pts | **5 Questions** (5 pts/item) | 6–7 Mins |
| **3. Communication Level** | 20% | 20 Pts | **4 Questions** (5 pts/item) | 4–5 Mins |
| **4. Behavioral Learning Readiness** | 15% | 15 Pts | **3 Questions** (5 pts/item) | 4–5 Mins |
| **5. Fine Motor & Technology Skills** | 15% | 15 Pts | **3 Questions** (5 pts/item) | 3–4 Mins |
| **Total Framework Standard** | **100%** | **100 Pts** | **20 Questions** | **25–30 Mins** |

---

## Competency Domain Specifications

### 1. Cognitive Ability (25 Points | 5 Questions)
* **Purpose:** Evaluates fundamental computational thinking, visual memory, and logical problem-solving skills required for computer science and robotics.
* **Measured Competencies:** Pattern Recognition, Logical Reasoning, Visual Sequencing, Classification, Cause & Effect, Visual Memory.
* **Scoring Standard:** 5 Questions $\times$ 5 Points = 25 Points Maximum.
* **Sample Activities:** Visual pattern matrix completion, 3D shape sequence forecasting, logical relation matching, missing shape identification.

### 2. Functional Skills (25 Points | 5 Questions)
* **Purpose:** Measures independent task execution, multi-step instruction adherence, and working memory efficiency under structured constraints.
* **Measured Competencies:** Multi-Step Instruction Execution, Sustained Attention, Working Memory, Task Completion, Practical Problem Solving.
* **Scoring Standard:** 5 Questions $\times$ 5 Points = 25 Points Maximum.
* **Sample Activities:** Visual code block sequencing for robot navigation, memory location recall mazes, multi-step goal execution.

### 3. Communication Level (20 Points | 4 Questions)
* **Purpose:** Evaluates how effectively the student comprehends visual, audio, and written instructions during interactive learning scenarios.
* **Measured Competencies:** Listening Comprehension, Technical Vocabulary Association, Instruction Following, Picture-Concept Matching, Verbal Understanding.
* **Scoring Standard:** 4 Questions $\times$ 5 Points = 20 Points Maximum.
* **Sample Activities:** Audio prompt to visual concept matching, technical vocabulary identification, audio-guided mission choices.

### 4. Behavioral Learning Readiness (15 Points | 3 Questions)
* **Purpose:** Measures non-academic psychological behaviors that govern learning success, resilience under stress, and adaptability to changing environments.
* **Measured Competencies:** Persistence, Cognitive Flexibility, Error Recovery Rate, Adaptability to Rule Shifts, Response to Hints/Feedback.
* **Scoring Standard:** 3 Questions $\times$ 5 Points = 15 Points Maximum.
* **Sample Activities:** Dynamic rule-switch sorting games (sorting criteria flips mid-task to observe reaction and error recovery), progressive difficulty stress challenges.

### 5. Fine Motor & Technology Skills (15 Points | 3 Questions)
* **Purpose:** Evaluates physical precision and speed when interacting with digital input devices (touchscreen, mouse, keyboard).
* **Measured Competencies:** Mouse Control, Touch Precision, Drag & Drop Fluidity, Target Alignment, Interface Navigation.
* **Scoring Standard:** 3 Questions $\times$ 5 Points = 15 Points Maximum.
* **Sample Activities:** Precision target alignment, drag-and-drop programming block assembly, trajectory path tracing.

---

## Standardized Scoring Engine & Telemetry Evaluation

The final **Technology Readiness Score (TRS)** is derived using a standardized item-level scoring formula that balances **Item Accuracy**, **Attempt Counts**, **Hint Usage**, and **Time Efficiency**:

### Item Scoring Calculation (Per Question $i$)
Each question $i$ yields a raw item score $Q_i \in [0, 5]$:

$$Q_i = 5.0 \times A_i \times \text{Multiplier}_{\text{time}} \times \text{Multiplier}_{\text{hints}} \times \text{Multiplier}_{\text{attempts}}$$

Where:
- $A_i \in [0.0, 1.0]$: Accuracy score on item $i$ (1.0 for fully correct, partial credit for multi-step tasks).
- $\text{Multiplier}_{\text{time}} = \max\left(0.7, 1.0 - 0.1 \cdot \max\left(0, \frac{T_{\text{actual}} - T_{\text{expected}}}{T_{\text{expected}}}\right)\right)$
- $\text{Multiplier}_{\text{hints}} = \max\left(0.5, 1.0 - 0.15 \cdot N_{\text{hints}}\right)$
- $\text{Multiplier}_{\text{attempts}} = \max\left(0.6, 1.0 - 0.10 \cdot (N_{\text{attempts}} - 1)\right)$

### Domain Score & Technology Readiness Score (TRS)
$$\text{Domain Score}_d = \sum_{i \in \text{Domain}_d} Q_i$$

$$\text{Technology Readiness Score (TRS)} = \sum_{d=1}^{5} \text{Domain Score}_d \quad (\text{Max 100 Points})$$

---

## Track Placement Matrix & Safety Override Flags

| Technology Readiness Score (TRS) | Primary Recommended Track | Curriculum Focus |
| :---: | :--- | :--- |
| **0 – 25** | **Explorer** | Foundational digital literacy, spatial puzzles, block basics. |
| **26 – 50** | **Builder** | Structured block programming, basic robotics navigation. |
| **51 – 75** | **Creator** | Multi-step logic, intermediate block coding, sensor interaction. |
| **76 – 90** | **Innovator** | Complex logic, visual script automation, problem-solving. |
| **91 – 100** | **Future Engineer** | Advanced computational thinking, text-based code transition, AI fundamentals. |

### Critical Domain Safety Override Rules
To guarantee accurate placement, if a student achieves a high total score but demonstrates severe weakness in core foundational domains, the system triggers a **Targeted Support Flag**:

1. **Cognitive Deficiency Flag:** Triggered if Cognitive Ability score $< 10.0$ / $25$ ($<40\%$).
2. **Functional Deficiency Flag:** Triggered if Functional Skills score $< 10.0$ / $25$ ($<40\%$).
3. **Communication Support Flag:** Triggered if Communication Level score $< 7.0$ / $20$ ($<35\%$).
4. **Behavioral Resilience Flag:** Triggered if Behavioral Readiness score $< 5.25$ / $15$ ($<35\%$).
5. **Fine Motor Support Flag:** Triggered if Fine Motor score $< 5.25$ / $15$ ($<35\%$).
