const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spin-button");
const result = document.getElementById("result");
const ctx = wheel.getContext("2d");

const prizes = [
    { name: "Banana", image: "banana.png" },
    { name: "Blue Shell", image: "blue_shell.png" },
    { name: "Mushroom", image: "mushroom.png" },
    { name: "Star", image: "star.png" },
    { name: "Green Shell", image: "green_shell.png" },
    { name: "Red Shell", image: "red_shell.png" }
];

const numPrizes = prizes.length;
let loadedImages = [];
let currentDegree = 0;
let selectedPrize = null;
const currentSpinDuration = 5000; // for example, 5 seconds. Adjust as necessary

// Load all the images.
prizes.forEach((prize, index) => {
    const image = new Image();
    image.onerror = (e) => {
        console.error("Error loading image", e);
    };
    image.src = prize.image;
    image.onload = () => {
        loadedImages[index] = image;
        if (loadedImages.length === numPrizes) {
            drawWheel();  // Call drawWheel only when all images have loaded
        }
    };
});

function drawWheel() {
    const radius = wheel.width / 2;
    const sliceAngle = (2 * Math.PI) / numPrizes;

    for (let i = 0; i < numPrizes; i++) {
        // Clip the slice
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.closePath();
        ctx.save();
        ctx.clip();

        // Get the image from the loaded list
        const image = loadedImages[i];

        // If the image is available, draw it stretched to the bounds of the slice
        if (image) {

            // Calculate slice height and image aspect ratio
            const sliceHeight = 2 * radius * Math.sin(sliceAngle / 2);
            const aspectRatio = image.width / image.height;

            // Calculate image dimensions
            let imageHeight = sliceHeight;
            let imageWidth = imageHeight * aspectRatio;

            // If the image width is too big for the slice, adjust based on width
            if (imageWidth > 0.5 * radius) {
                imageWidth = 0.5 * radius;
                imageHeight = imageWidth / aspectRatio;
            }

            // Calculate draw position
            const distanceFactor = 0.75; // Adjust this value to bring the image closer or farther from the center
            const centerX = radius + distanceFactor * radius * Math.cos(i * sliceAngle + sliceAngle / 2);
            const centerY = radius + distanceFactor * radius * Math.sin(i * sliceAngle + sliceAngle / 2);
            const dx = centerX - imageWidth / 2;
            const dy = centerY - imageHeight / 2;

            ctx.drawImage(image, dx, dy, imageWidth, imageHeight);

            const rectWidth = 30;  // Adjust as needed
            const rectHeight = sliceHeight;
            const rectX = centerX - rectWidth / 2;
            const rectY = centerY - rectHeight / 2;
            ctx.fillStyle = "rgba(10, 0, 0, 0.0001)";  // Nearly transparent
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

            prizes[i].clickArea = { x: rectX, y: rectY, width: rectWidth, height: rectHeight };  // Store for later

        }
        
        ctx.restore();

        // Draw the slice border
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.strokeStyle = '#000';  // Change this if you want a different border color
        ctx.stroke();
    }
}



let cumulativeRotation = 0; // Add this line outside any function

function spin2() {
    let spinDegrees;

    if (selectedPrize) {
        const prizeIndex = prizes.indexOf(selectedPrize);
        const sliceDegree = 360 / numPrizes;
        const desiredDegree = 360 - (prizeIndex * sliceDegree + sliceDegree / 2);
        
        const remainingDegrees = desiredDegree - (cumulativeRotation % 360); // Find out how many degrees are left to reach the desired position
        spinDegrees = remainingDegrees >= 0 ? remainingDegrees : 360 + remainingDegrees; // Ensure it's a positive value
        
        const fullSpins = 3600; // 10 spins (10 * 360)
        spinDegrees += fullSpins;
    } else {
        spinDegrees = (Math.random() * 360 + 3600); // At least 10 spins
    }

    cumulativeRotation += spinDegrees;
    const totalRotation = cumulativeRotation;
    wheel.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
        const degrees = totalRotation % 360;
        const prizeSlice = Math.floor((360 - degrees) / (360 / numPrizes));
        result.textContent = `You got: ${prizes[prizeSlice].name}`;
        
        selectedPrize = null; // Clear the selected prize after spin
    }, 4000); // Assuming 4s is the duration of the spin

    currentDegree = totalRotation % 360;
}
wheel.addEventListener("click", (event) => {
    const rect = wheel.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Translate click to the wheel's center
    const translatedX = x - wheel.width / 2;
    const translatedY = y - wheel.height / 2;

    // Rotate the translated click position in the reverse direction of the wheel rotation
    const radians = -currentDegree * (Math.PI / 180);
    const rotatedX = translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
    const rotatedY = translatedX * Math.sin(radians) + translatedY * Math.cos(radians);

    // Calculate angle from rotated coordinates
    let angle = Math.PI - Math.atan2(rotatedY, rotatedX);
    angle = 2 * Math.PI - angle; // Correct for X-axis reflection
    const slice = Math.floor((angle + Math.PI )/ (2 * Math.PI / numPrizes))%numPrizes;
    console.log(prizes[slice])
    console.log(translatedX)
    console.log(translatedY)
    console.log(slice)

    selectedPrize = prizes[slice];
});

spinButton.addEventListener("click", spin2);