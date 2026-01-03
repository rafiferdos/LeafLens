export interface DiseaseData {
    name: string;
    description: string;
    symptoms: string[];
    spread: string;
    control: string[];
    link: string;
}

export const diseaseDatabase: Record<string, DiseaseData> = {
    "Healthy": {
        name: "Healthy Plant",
        description: "Your plant appears to be healthy and thriving! There are no visible signs of pests or diseases.",
        symptoms: ["Vibrant green leaves", "No spots or holes", "Steady growth"],
        spread: "N/A",
        control: ["Continue regular watering", "Ensure proper sunlight", "Monitor for future pests"],
        link: "https://www.google.com/search?q=tips+to+keep+plants+healthy"
    },
    "Caterpillars": {
        name: "Caterpillar Infestation",
        description: "Caterpillars are the larval stage of butterflies and moths. They are voracious eaters and can quickly defoliate plants if left unchecked. They chew on leaves, stems, and sometimes fruits.",
        symptoms: [
            "Ragged holes in leaves",
            "Missing leaf edges",
            "Presence of frass (black droppings)",
            "Rolled leaves or webbing"
        ],
        spread: "Adult moths/butterflies lay eggs on the plant. Caterpillars hatch and move to adjacent leaves or plants.",
        control: [
            "Hand-pick visible caterpillars",
            "Use Bacillus thuringiensis (Bt)",
            "Encourage natural predators like birds",
            "Apply neem oil for young larvae"
        ],
        link: "https://www.google.com/search?q=caterpillar+control+on+plants"
    },
    "EggplantMosaicVirus": {
        name: "Eggplant Mosaic Virus",
        description: "A viral disease affecting eggplants and related crops. It causes distinct patterns on leaves and can stunt growth and reduce yields.",
        symptoms: [
            "Mosaic patterns of light/dark green",
            "Yellow mottling on leaves",
            "Stunted plant growth",
            "Deformed or puckered leaves"
        ],
        spread: "Transmitted primarily by beetles (like flea beetles) and sometimes by mechanical contact or infected seeds.",
        control: [
            "Remove and destroy infected plants immediately",
            "Control beetle vectors",
            "Sanitize tools regularly",
            "Use virus-free seeds"
        ],
        link: "https://www.google.com/search?q=eggplant+mosaic+virus+treatment"
    },
    "EpilachnaBeetleInfestation": {
        name: "Epilachna Beetle Infestation",
        description: "Also known as the Mexican Bean Beetle or Hadda Beetle. Both larvae and adults feed on leaves, often skeletonizing them by eating the tissue between veins.",
        symptoms: [
            "Skeletonized leaves (lace-like appearance)",
            "Yellow/spiny larvae present",
            "Dry, brown patches on leaves",
            "Reduced photosynthesis"
        ],
        spread: "Adult beetles fly to new plants to lay eggs. Larvae crawl to nearby leaves.",
        control: [
            "Hand-pick beetles and larvae",
            "Use neem oil or insecticidal soap",
            "Encourage beneficial insects",
            "Remove weeds that host the beetles"
        ],
        link: "https://www.google.com/search?q=epilachna+beetle+control"
    },
    "FungalBlight": {
        name: "Fungal Blight",
        description: "A general term for fungal infections that cause rapid browning and death of plant tissues. It thrives in humid conditions and spreads quickly.",
        symptoms: [
            "Brown or black spots on leaves/stems",
            "Rapid yellowing or wilting",
            "White fungal growth in high humidity",
            "Lesions with concentric rings"
        ],
        spread: "Spores spread via wind, water splash, or contaminated tools. High humidity accelerates spread.",
        control: [
            "Prune affected areas immediately",
            "Improve air circulation",
            "Avoid overhead watering",
            "Apply copper-based fungicides"
        ],
        link: "https://www.google.com/search?q=fungal+blight+treatment+plants"
    },
    "ThripsInfestation": {
        name: "Thrips Infestation",
        description: "Thrips are tiny, slender insects that puncture plant cells to suck out contents. They cause silvering of leaves and can transmit viruses.",
        symptoms: [
            "Silvery or bronze streaks on leaves",
            "Black specks (fecal matter) on leaves",
            "Distorted young growth",
            "Flower drop or deformation"
        ],
        spread: "They fly or are carried by wind to new plants. They multiply rapidly in warm conditions.",
        control: [
            "Use blue sticky traps",
            "Spray with insecticidal soap or neem oil",
            "Introduce predatory mites",
            "Remove heavily infested leaves"
        ],
        link: "https://www.google.com/search?q=thrips+control+on+plants"
    }
};
