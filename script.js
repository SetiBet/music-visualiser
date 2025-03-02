const audioFile = document.getElementById("audioFile");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Web Audio API variables
let audioContext, analyser, source, dataArray;

// Listen for file upload
audioFile.addEventListener("change", function() {
    const file = this.files[0];
    if (!file) return;

    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.controls = true;
    document.body.appendChild(audio);
    audio.play();

    setupAudioContext(audio);
});

function setupAudioContext(audio) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audio);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 256; // Determines frequency resolution

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawVisualizer();
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);

    analyser.getByteFrequencyData(dataArray);

    const bass = dataArray[0] / 2; // Scale bass effect to avoid extreme brightness
    const bgColor = `rgb(${bass}, 0, ${255 - bass})`;
    document.body.style.backgroundColor = bgColor;
    
    

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let bassBoost = dataArray[0] / 2; // Reacts to the bass frequencies
    const radius = 120 + bassBoost; // Expands and shrinks with the beat
    const barCount = dataArray.length;

    for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const barHeight = dataArray[i] * 1.2; // Scale bar height

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        const red = (i * 10) % 255;
        const green = (barHeight / 2) % 255;
        const blue = 255 - red;

        ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.8)`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;  // Soft glow effect
        ctx.shadowColor = `rgb(${red}, ${green}, ${blue})`;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}



