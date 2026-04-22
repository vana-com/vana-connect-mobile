import type { CanvasData } from "./canvas-types";

const SEED: CanvasData = {
  clusters: [
    { id: "work",   name: "WORK",   color: "#F9F000" },
    { id: "people", name: "PEOPLE", color: "#FF2D9F" },
    { id: "body",   name: "BODY",   color: "#39FF14" },
    { id: "making", name: "MAKING", color: "#0051FF" },
    { id: "places", name: "PLACES", color: "#E63946" },
  ],

  nodes: [
    // WORK — upper right
    { id: "vana",          name: "VANA",           cluster: "work",   size: "xl",  position: { x: 80,   y: -180 }, itemCount: 342 },
    { id: "opendatalabs",  name: "OPENDATALABS",   cluster: "work",   size: "xl",  position: { x: 270,  y: -90  }, itemCount: 289 },
    { id: "paradigm",      name: "PARADIGM",       cluster: "work",   size: "md",  position: { x: 170,  y: -55  }, itemCount: 47  },
    { id: "lfdt",          name: "LFDT",           cluster: "work",   size: "md",  position: { x: 290,  y: -195 }, itemCount: 63  },
    { id: "podcast",       name: "PODCAST",        cluster: "work",   size: "sm",  position: { x: 385,  y: -115 }, itemCount: 18  },

    // PEOPLE — lower left
    { id: "dean",          name: "DEAN",           cluster: "people", size: "xxl", position: { x: -275, y: 130  }, itemCount: 847 },
    { id: "dobbie",        name: "DOBBIE",         cluster: "people", size: "md",  position: { x: -390, y: 30   }, itemCount: 124 },
    { id: "oreo",          name: "OREO",           cluster: "people", size: "md",  position: { x: -395, y: 230  }, itemCount: 93  },
    { id: "family",        name: "FAMILY",         cluster: "people", size: "xl",  position: { x: -175, y: 240  }, itemCount: 312 },
    { id: "cz",            name: "CZ",             cluster: "people", size: "sm",  position: { x: -55,  y: -80  }, itemCount: 22  },

    // BODY — right
    { id: "yoga",          name: "YOGA",           cluster: "body",   size: "md",  position: { x: 390,  y: 60   }, itemCount: 78  },
    { id: "swimming",      name: "SWIMMING",       cluster: "body",   size: "md",  position: { x: 470,  y: 165  }, itemCount: 55  },
    { id: "handstands",    name: "HANDSTANDS",     cluster: "body",   size: "sm",  position: { x: 315,  y: 170  }, itemCount: 34  },
    { id: "sleep",         name: "SLEEP",          cluster: "body",   size: "md",  position: { x: 475,  y: 45   }, itemCount: 180 },

    // MAKING — upper left
    { id: "crochet",       name: "CROCHET",        cluster: "making", size: "xl",  position: { x: -200, y: -200 }, itemCount: 156 },
    { id: "music-rec",     name: "MUSIC REC",      cluster: "making", size: "md",  position: { x: -330, y: -120 }, itemCount: 41  },
    { id: "writing",       name: "WRITING",        cluster: "making", size: "md",  position: { x: -115, y: -295 }, itemCount: 88  },

    // PLACES — lower right
    { id: "brisbane",      name: "BRISBANE",       cluster: "places", size: "xl",  position: { x: 180,  y: 305  }, itemCount: 203 },
    { id: "nyc",           name: "NYC",            cluster: "places", size: "md",  position: { x: 330,  y: 345  }, itemCount: 63  },
    { id: "timor-leste",   name: "TIMOR-LESTE",    cluster: "places", size: "sm",  position: { x: 85,   y: 390  }, itemCount: 27  },
    { id: "house",         name: "HOUSE",          cluster: "places", size: "md",  position: { x: 60,   y: 255  }, itemCount: 94  },

    // Floater
    { id: "karma",         name: "KARMA",          cluster: "people", size: "sm",  position: { x: -55,  y: 380  }, itemCount: 7   },
  ],

  edges: [
    { id: "vana-odl",           from: "vana",         to: "opendatalabs", strength: 3 },
    { id: "vana-lfdt",          from: "vana",         to: "lfdt",         strength: 2 },
    { id: "vana-paradigm",      from: "vana",         to: "paradigm",     strength: 2 },
    { id: "odl-podcast",        from: "opendatalabs", to: "podcast",      strength: 1 },
    { id: "dean-dobbie",        from: "dean",         to: "dobbie",       strength: 3 },
    { id: "dean-oreo",          from: "dean",         to: "oreo",         strength: 3 },
    { id: "dean-family",        from: "dean",         to: "family",       strength: 2 },
    { id: "dean-house",         from: "dean",         to: "house",        strength: 3 },
    { id: "handstands-yoga",    from: "handstands",   to: "yoga",         strength: 2 },
    { id: "writing-crochet",    from: "writing",      to: "crochet",      strength: 1 },
    { id: "writing-vana",       from: "writing",      to: "vana",         strength: 2 },
  ],
};

export default SEED;
