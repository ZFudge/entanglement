function Dot(x, y, radius, verticalVelocity, horizontalVelocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.verticalVelocity = verticalVelocity;
    this.horizontalVelocity = horizontalVelocity;
}

Dot.prototype.adjust = function() {
    this.y += this.verticalVelocity;
    this.x += this.horizontalVelocity;
    const remove = this.removeCheck();
    (remove) ? this.remove() : this.draw();
}

Dot.prototype.draw = function() {
    const ctx = dot.context;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
}

Dot.prototype.removeCheck = function() {
    const outerRadius = this.radius * dot.outerRadiusMultiplier;
    const leftX = -outerRadius;
    const rightX = dot.canvas.width + outerRadius;
    const topY = -outerRadius;
    const bottomY = dot.canvas.height + outerRadius;
    return (this.x < leftX || this.x > rightX || this.y < topY || this.y > bottomY);
}

Dot.prototype.remove = function() {
    dot.dots.splice(dot.dots.indexOf(this), 1);
}

function main() {
    dot.dripCheck();
    dot.adjust();
    dot.entangleCheck();
}

const dot = {
    ms: 100,
    maxBlurWidth: 3,
    outerRadiusMultiplier: 60,
    dots: [],
    drip: function() {
        const poleVertical = (Math.random() < 0.5);
        const x = Math.floor(Math.random() * dot.canvas.width * 0.8 + dot.canvas.width * 0.1);
        const radius = Math.ceil(1 + Math.random() * 3);
        const y = (poleVertical) ? -radius * this.outerRadiusMultiplier : radius * this.outerRadiusMultiplier + dot.canvas.height;
        const verticalVelocity = (poleVertical) ? Math.random() : -Math.random();
        const horizontalVelocity = Math.random() - 0.5;
        this.dots.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
    },
    maximumDots: 15,
    dripCheck: function() {
        if (Math.random() < 0.05 && this.dots.length < this.maximumDots) dot.drip();
    },
    adjust: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dots.reverse().forEach((cur) => cur.adjust());
    },
    entangleCheck(index = 0) {
        const currentDot = this.dots[index];
        for (let i = index; i < this.dots.length; i++) {
            const loopDot = this.dots[i];
            const outerRadius = (currentDot.radius > loopDot.radius) ? currentDot.radius * this.outerRadiusMultiplier : loopDot.radius * this.outerRadiusMultiplier;
            const hypotenuse = (((currentDot.x - loopDot.x) ** 2) + ((currentDot.y - loopDot.y) ** 2)) ** 0.5;
            if (hypotenuse < outerRadius) {
                this.entangle(currentDot, loopDot, outerRadius, hypotenuse);
            }
        }
        if (index < this.dots.length - 2) this.entangleCheck(index + 1);
    },
    entangle(dot1, dot2, outerRadius, distance) {
        const intensity = outerRadius - distance;
        const width = (1 / outerRadius) * intensity * this.maxBlurWidth;
        const ctx = this.context;
        ctx.strokeStyle = 'white';
        ctx.shadowBlur = width / 2;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineTo(dot2.x, dot2.y);
        ctx.stroke();
    },
    resize(width, height) {
        const cnv = this.canvas;
        const ctx = this.context;
        cnv.width = width;
        cnv.height = height;
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 0.5;
        ctx.fillStyle = 'white';
        /** /clearInterval(this.loop); this.loop = setInterval(main, this.ms); /**/
    },
    mouseMove(x, y) {
        console.log(arguments)
    },
    click(x, y) {
        console.log(arguments)
    }
};

dot.canvas = document.getElementById('entanglement-canvas');
dot.context = dot.canvas.getContext('2d');
dot.resize(innerWidth, innerHeight);
dot.loop = setInterval(main, dot.ms);

for (var i = 0; i < 15; i++) {
    const x = Math.floor(Math.random() * dot.canvas.width * 0.8);
    const y = Math.floor(Math.random() * dot.canvas.height * 0.8);
    const radius = Math.ceil(1 + Math.random() * 2);
    const verticalVelocity = Math.random() - 0.5;
    const horizontalVelocity = Math.random() - 0.5;;
    dot.dots.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
}

window.addEventListener("resize", () => dot.resize(innerWidth, innerHeight));
document.addEventListener('mousemove', (e) => dot.mouseMove(e.clientX, e.clientY));
document.addEventListener('click', (e) => dot.click(e.clientX, e.clientY));
