document.addEventListener("DOMContentLoaded", function() {
    const orb = document.querySelector(".orb");
    const square = document.querySelector(".color-changing-square");
    const icon = document.querySelector("#icon");
    const gradients = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5'];
    let currentGradient = 0;

    document.addEventListener("mousemove", (e) => {
        orb.style.left = `${e.clientX}px`;
        orb.style.top = `${e.clientY}px`;
    });

    function changeGradient() {
        // Remove current gradient class
        square.classList.remove(gradients[currentGradient]);
        // Update to next gradient class
        currentGradient = (currentGradient + 1) % gradients.length;
        square.classList.add(gradients[currentGradient]);
    }

    square.addEventListener("click", changeGradient);
    icon.addEventListener("click", changeGradient);
});

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', message => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});
