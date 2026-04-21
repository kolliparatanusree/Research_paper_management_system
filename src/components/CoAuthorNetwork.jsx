import React, { useMemo } from "react";
import { ForceGraph2D } from "react-force-graph";
export default function CoAuthorNetwork({ publications = [], coAuthors = [], facultyId }) {

  const graphData = useMemo(() => {
    const nodes = new Map();
    const links = [];

    // main faculty node
    if (facultyId) {
      nodes.set(facultyId, { id: facultyId });
    }

    // 1️⃣ from publications
    publications.forEach((pub) => {
      const main = pub.userId || facultyId;

      if (main) nodes.set(main, { id: main });

      (pub.coAuthors || []).forEach((co) => {
        nodes.set(co, { id: co });

        links.push({
          source: main,
          target: co,
        });
      });
    });

    // 2️⃣ from direct coAuthors (hoduidrequests)
    coAuthors.forEach((co) => {
      nodes.set(co, { id: co });

      links.push({
        source: facultyId,
        target: co,
      });
    });

    return {
      nodes: Array.from(nodes.values()),
      links,
    };
  }, [publications, coAuthors, facultyId]);

  return (
    <div style={{ height: "350px", marginTop: "10px" }}>
      <h4>🔗 Co-Author Network</h4>

      <ForceGraph2D
        graphData={graphData}
        nodeAutoColorBy="id"
        nodeLabel="id"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
      />
    </div>
  );
}