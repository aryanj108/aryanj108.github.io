import React from 'react';
import { PATH_META } from './pathfinding';
import { SORT_META } from './sorting';
import AlgoVizTheme from './theme';
import { HEAVY } from './types';
import { Col, Group, Row, Swatch } from './ui';

const cellStyle: React.CSSProperties = {
    fontFamily: 'MSSerif',
    fontSize: 11,
    padding: '3px 8px',
    textAlign: 'left',
    borderBottom: '1px solid #b4b8bd',
    whiteSpace: 'nowrap',
};

const headStyle: React.CSSProperties = Object.assign({}, cellStyle, {
    background: '#b4b8bd',
    borderBottom: '1px solid #86898d',
    fontWeight: 'bold' as const,
});

const bodyStyle: React.CSSProperties = {
    fontFamily: 'MSSerif',
    fontSize: 12,
    lineHeight: 1.65,
    color: '#1c1c1c',
    marginBottom: 10,
};

const AboutPanel: React.FC = () => (
    <Col style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
        <Group title="How this works" style={{ marginBottom: 8 }}>
            <p style={bodyStyle}>
                Each algorithm runs to completion first, synchronously, over its own copy of the
                data, recording a typed log of everything it did &mdash; every comparison, swap,
                write, cell opened and cell closed. Only then does the player replay that log onto
                the canvas at whatever speed you pick.
            </p>
            <p style={bodyStyle}>
                Separating the algorithm from the animation is what makes pausing, single-stepping
                and dragging the scrubber backwards possible: seeking is just replaying the log
                from the start up to that point. It also means the counters below are exact rather
                than sampled, and the <b>Compute</b> figure is the algorithm&apos;s real running
                time on your machine &mdash; independent of how fast it is being drawn.
            </p>
        </Group>

        <Group title="Sorting algorithms" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={headStyle}>Algorithm</th>
                            <th style={headStyle}>Best</th>
                            <th style={headStyle}>Average</th>
                            <th style={headStyle}>Worst</th>
                            <th style={headStyle}>Space</th>
                            <th style={headStyle}>Stable</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SORT_META.map((m) => (
                            <tr key={m.key}>
                                <td style={cellStyle}>{m.label}</td>
                                <td style={cellStyle}>{m.best}</td>
                                <td style={cellStyle}>{m.average}</td>
                                <td style={cellStyle}>{m.worst}</td>
                                <td style={cellStyle}>{m.space}</td>
                                <td style={cellStyle}>{m.stable ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p style={Object.assign({}, bodyStyle, { marginTop: 8, marginBottom: 0 })}>
                Values are a permutation of 1..n, so a sorted array is a clean ramp and no two bars
                share a height. Try <b>Selection Sort</b> against <b>Bubble Sort</b> on the
                &ldquo;Nearly sorted&rdquo; distribution: bubble sort exits after one clean pass,
                while selection sort does the identical number of comparisons it always does.
            </p>
        </Group>

        <Group title="Pathfinding algorithms" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={headStyle}>Algorithm</th>
                            <th style={headStyle}>Shortest route</th>
                            <th style={headStyle}>Uses terrain cost</th>
                            <th style={headStyle}>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {PATH_META.map((m) => (
                            <tr key={m.key}>
                                <td style={cellStyle}>{m.label}</td>
                                <td style={cellStyle}>
                                    {m.optimal ? 'Guaranteed' : 'Not guaranteed'}
                                </td>
                                <td style={cellStyle}>{m.weighted ? 'Yes' : 'No'}</td>
                                <td
                                    style={Object.assign({}, cellStyle, {
                                        whiteSpace: 'normal' as const,
                                        minWidth: 220,
                                    })}
                                >
                                    {m.note}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p style={Object.assign({}, bodyStyle, { marginTop: 8, marginBottom: 0 })}>
                On a grid with no heavy terrain, Dijkstra and A* reduce to BFS &mdash; every move
                costs the same, so all three return routes of equal cost and the only visible
                difference is how many cells each one opens. Raise <b>Heavy</b> above 0% (each such
                cell costs {HEAVY} to enter) and the three genuinely diverge: BFS still returns the
                fewest-cells route while Dijkstra and A* return the cheapest one, which is usually
                longer and goes around.
            </p>
        </Group>

        <Group title="Legend" style={{ marginBottom: 8 }}>
            <Row wrap>
                <Swatch color={AlgoVizTheme.barCompare} label="Compared" />
                <Swatch color={AlgoVizTheme.barPivot} label="Pivot / current minimum" />
                <Swatch color={AlgoVizTheme.barWrite} label="Just written" />
                <Swatch color={AlgoVizTheme.barSorted} label="In final position" />
                <Swatch color={AlgoVizTheme.cellFrontier} label="Frontier (open set)" />
                <Swatch color={AlgoVizTheme.cellVisited} label="Closed" />
                <Swatch color={AlgoVizTheme.cellPath} label="Final route" />
                <Swatch color={AlgoVizTheme.cellWeight} label="Heavy terrain" />
            </Row>
        </Group>

        <Group title="Credits">
            <p style={Object.assign({}, bodyStyle, { marginBottom: 0 })}>
                AlgoViz &mdash; built for this desktop by Aryan Jalota. Sorting and search
                implementations are written from scratch; the maze generators are the standard
                recursive backtracker, randomized Prim&apos;s, and recursive division.
            </p>
        </Group>
    </Col>
);

export default AboutPanel;
