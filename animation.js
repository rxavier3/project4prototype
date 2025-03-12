import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Add space before the animation section
d3.select("body").append("div").style("height", "60px"); // Adds vertical spacing

// Create Animation Container
const animationContainer = d3.select("body")
    .append("div")
    .attr("id", "animation-container")
    .attr("class", "animation-container")
    .style("margin-top", "30px")
    .style("padding", "20px");

// ** Create a CLEARLY DISTINCT Section for Animation Sliders **
const animationSliderContainer = d3.select("body")
    .append("div")
    .attr("class", "animation-slider-container")
    .style("background", "#ffe6e6")  // Light red background for distinction
    .style("padding", "20px")
    .style("border-radius", "12px")
    .style("border", "3px solid red")  // Red border to visually separate
    .style("box-shadow", "0 0 10px rgba(255, 0, 0, 0.2)")
    .style("max-width", "600px")
    .style("margin", "40px auto") // Increase margin for spacing
    .style("text-align", "center");

// ** Add title for animation sliders with clear distinction **
animationSliderContainer.append("h2")
    .text("Animation Drug Effects")
    .style("color", "red")
    .style("font-size", "20px")
    .style("margin-bottom", "15px");

// Define a separate set of drug names for animation (Now using real drug names)
const animationDrugs = [
    { id: "anim_ppf", name: "Propofol (PPF)" },
    { id: "anim_mdz", name: "Midazolam (MDZ)" },
    { id: "anim_ftn", name: "Fentanyl (FTN)" },
    { id: "anim_rocu", name: "Rocuronium (ROCU)" },
    { id: "anim_vecu", name: "Vecuronium (VECU)" }
];

const animationDrugSliders = {};

// Create sliders for animation (Separate from Prediction)
animationDrugs.forEach(drug => {
    const drugDiv = animationSliderContainer.append("div")
        .attr("class", "slider-group")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "space-between")
        .style("margin-bottom", "15px"); // Adds space between sliders

    drugDiv.append("label")
        .text(`${drug.name}: `)  // Use actual drug name instead of variable name
        .style("font-weight", "bold")
        .style("color", "darkred");

    animationDrugSliders[drug.id] = drugDiv.append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("step", 1)
        .attr("value", 50)
        .style("width", "70%");
});

// Set dimensions for animation
const width = 800, height = 400;

// Create SVG for animation
const svg = animationContainer.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("background", "#ffdddd")
    .style("border", "4px solid red") // Adds distinct border
    .style("border-radius", "10px");

// Create particles (simulated blood cells)
const numParticles = 100;
const particles = Array.from({ length: numParticles }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 5 + 2,
    speed: Math.random() * 0.5 + 0.1  // **Slowed down particles significantly**
}));

const particleElements = svg.selectAll("circle")
    .data(particles)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.size)
    .attr("fill", "red")
    .attr("opacity", 0.6);

let animationSpeed = 5;  // Default animation intensity

// Function to estimate Animation Effect (Separate from Blood Loss)
function estimateAnimationEffect() {
    let animationIntensity = 300;  // Base effect intensity

    // Assign weights to each animation drug's impact
    const animationDrugWeights = {
        "anim_ppf": 1.8,
        "anim_mdz": 1.2,
        "anim_ftn": 2.5,
        "anim_rocu": 2.0,
        "anim_vecu": 1.7
    };

    animationDrugs.forEach(drug => {
        const drugDose = Number(animationDrugSliders[drug.id].property("value"));
        animationIntensity += drugDose * animationDrugWeights[drug.id];  // Weighted impact on animation
    });

    return animationIntensity;
}

// Function to update animation based on the separate animation drug sliders
function updateAnimationFromSliders() {
    const animationEffect = estimateAnimationEffect();
    updateAnimation(animationEffect);
}

// Attach event listeners to animation sliders (but NOT affecting blood loss histogram)
Object.values(animationDrugSliders).forEach(slider => {
    slider.on("input", updateAnimationFromSliders);
});

// Function to update animation based on animation drugs (Independent of Blood Loss Histogram)
export function updateAnimation(animationEffect) {
    const severityFactor = Math.min(animationEffect / 1000, 1);  // Normalize severity (0 to 1)

    // Change background color based on severity
    const bgColor = d3.interpolateRgb("#ffdddd", "#ff0000")(severityFactor);
    animationContainer.style("background", bgColor);

    // Update particle size & color based on Animation Drug effects
    particleElements
        .transition()
        .duration(500)
        .attr("r", d => d.size * (1 + severityFactor))
        .attr("fill", d => d3.interpolateRgb("red", "darkred")(severityFactor));

    // **Slower Movement for Clarity**
    function moveParticles() {
        particles.forEach(p => {
            p.x += (Math.random() - 0.5) * severityFactor * 1.5;  // Slower movement
            p.y += (Math.random() - 0.5) * severityFactor * 1.5;  // Slower movement

            if (p.x > width) p.x = 0;
            if (p.x < 0) p.x = width;
            if (p.y > height) p.y = 0;
            if (p.y < 0) p.y = height;
        });

        particleElements
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        requestAnimationFrame(moveParticles);
    }

    moveParticles();
}

// Initialize animation with default values
updateAnimationFromSliders();
