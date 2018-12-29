const black = {
    ms: 60,
    canvas: document.getElementById('black-canvas'),
    dots: [],
    drip: function() {
        const flip = (Math.random() < 0.5);
        const x = Math.floor(Math.random() * black.canvas.width*0.8 + black.canvas.width*0.1);
        const r = Math.ceil(1 + Math.random() * 2);
        const y = (flip) ? -r * this.outerRadiusMultiplier : black.canvas.height + r * this.outerRadiusMultiplier;
        const v = (flip) ? Math.random() / 2 + Math.random() / 2 : (Math.random() / 2 + Math.random() / 2) * -1;
        const c = Math.floor(Math.random() * 50);
        this.dots.push(new Dot(x, y, r, v, c));
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
    outerRadiusMultiplier: 30,
    entangleCheck(index = 0) {
        const currentDot = this.dots[index];
        for (let i = index; i < this.dots.length; i++) {
            const loopDot = this.dots[i];
            const outerRadius = (currentDot.r > loopDot.r) ? currentDot.r * this.outerRadiusMultiplier : loopDot.r * this.outerRadiusMultiplier;
            const hypotenuse = (((currentDot.x - loopDot.x) ** 2) + ((currentDot.y - loopDot.y) ** 2)) ** 0.5;
            if (hypotenuse < outerRadius) {
                this.entangle(currentDot, loopDot, outerRadius, hypotenuse);
            }
        }
        if (index < this.dots.length - 2) this.entangleCheck(index + 1);
    },
    maxBlurWidth: 0.25,
    entangle(dot1, dot2, outerRadius, distance) {
        const intensity = outerRadius - distance;
        const width = (1 / outerRadius) * intensity * this.maxBlurWidth;
        const ctx = this.context;
        ctx.beginPath();
        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineWidth = width;
        ctx.lineTo(dot2.x, dot2.y)
        ctx.stroke();
    }    
}

black.context = black.canvas.getContext('2d');
//black.context.shadowColor = 'black';
//black.context.shadowBlur = 0.25;

function Dot(x, y, r, v, c) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.v = v;
    this.c = c;
}

Dot.prototype.adjust = function() {
    this.y += this.v;
    const remove = this.removeCheck();
    if (remove) {
        this.remove();
    } else {
        this.draw();
    }
}

Dot.prototype.draw = function() {
    const c = black.context;
    c.fillStyle = `rgb(${this.c}, ${this.c}, ${this.c})`;
    c.beginPath();
    c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    c.fill();
}

Dot.prototype.removeCheck = function() {
    const outerRadius = this.r * black.outerRadiusMultiplier;
    return (this.v < 0) ? this.y + this.r * outerRadius < 0 : this.y - outerRadius > black.canvas.height;
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
