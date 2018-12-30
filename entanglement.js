const black = {
    ms: 100,
    maxBlurWidth: 1, //0.25,
    outerRadiusMultiplier: 60,
    dots: [],
    drip: function() {
        const poleVertical = (Math.random() < 0.5);
        const x = Math.floor(Math.random() * black.canvas.width * 0.8 + black.canvas.width * 0.1);
        const radius = Math.ceil(1 + Math.random() * 2);
        const y = (poleVertical) ? -radius * this.outerRadiusMultiplier : radius * this.outerRadiusMultiplier + black.canvas.height;
        const verticalVelocity = (poleVertical) ? Math.random() : -Math.random();
        const horizontalVelocity = Math.random() - 0.5;
        const shade = Math.floor(Math.random() * 50);
        this.dots.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity, shade));
    },
    dripCheck: function() {
        if (Math.random() < 0.05 && this.dots.length < 20) black.drip();
    },
    adjust: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = this.dots.length - 1; i >= 0; i--) {
            this.dots[i].adjust();
        }
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
        ctx.beginPath();
        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineWidth = width;
        ctx.lineTo(dot2.x, dot2.y);
        ctx.stroke();
    }    
}

black.canvas = document.getElementById('black-canvas');
black.context = black.canvas.getContext('2d');
black.context.shadowColor = 'white'; // 'black';
black.context.shadowBlur = 0.5;
black.context.fillStyle = 'white';

function Dot(x, y, radius, verticalVelocity, horizontalVelocity, shade) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.verticalVelocity = verticalVelocity;
    this.horizontalVelocity = horizontalVelocity;
    this.shade = shade;
}

Dot.prototype.adjust = function() {
    this.y += this.verticalVelocity;
    this.x += this.horizontalVelocity;
    const remove = this.removeCheck();
    if (remove) {
        this.remove();
    } else {
        this.draw();
    }
}

Dot.prototype.draw = function() {
    const ctx = black.context;
    //ctx.fillStyle = `rgb(${this.shade}, ${this.shade}, ${this.shade})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
}

Dot.prototype.removeCheck = function() {
    const outerRadius = this.radius * black.outerRadiusMultiplier;
    return (this.verticalVelocity < 0) ? this.y + this.radius * outerRadius < 0 : this.y - outerRadius > black.canvas.height;
}

Dot.prototype.remove = function() {
    black.dots.splice(black.dots.indexOf(this), 1);
}

function main() {
    black.dripCheck();
    black.adjust();
    black.entangleCheck();
}

let loop = setInterval(main, black.ms);
