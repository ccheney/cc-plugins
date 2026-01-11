# cc-plugins

Custom Claude Code plugins for enhanced development workflows.

## Installation

First, add the GitHub marketplace:

```bash
/plugin marketplace add ccheney/cc-plugins
```

Then install the plugin:

```bash
claude plugin install ccheney/cc-plugins
```

## Skills

### mermaid-diagrams

Generate Mermaid diagrams in markdown. Claude will automatically use this skill when you ask for diagrams, charts, visualizations, or system documentation.

**Supported diagram types:**
- Flowcharts
- Sequence diagrams
- Class diagrams
- ER diagrams
- State diagrams
- Gantt charts
- Pie charts
- Mindmaps
- Timelines
- Git graphs
- C4 diagrams
- Quadrant charts
- Sankey diagrams
- XY charts

**Example usage:**
```
"Create a sequence diagram showing the OAuth flow"
"Draw an ER diagram for a blog database"
"Make a flowchart of the CI/CD pipeline"
```

**Did you know Mermaid can do this?**

```mermaid
sankey-beta

Visitors,Signed Up,4200
Visitors,Bounced,8500
Signed Up,Free Trial,3100
Signed Up,Churned,1100
Free Trial,Converted,1800
Free Trial,Churned,1300
Converted,Pro Plan,1200
Converted,Enterprise,600
```
