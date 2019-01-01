function Dot(x, y, radius, verticalVelocity, horizontalVelocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.verticalVelocity = verticalVelocity;
    this.horizontalVelocity = horizontalVelocity;
    this.targetVerticalVelocity = verticalVelocity;
    this.targetHorizontalVelocity = horizontalVelocity;
}

Dot.prototype.adjust = function(index) {
    const outerRadius = this.radius * dots.outerRadiusMultiplier;
    if (dots.drifting) {
        if (mouse.movable && mouse.coordinates.x && mouse.proximityCheck(this.x, this.y, outerRadius)) {
            this.push();
        } else if (this.checkInertia()) {
            this.horizontalVelocity *= 0.99;
            this.verticalVelocity *= 0.99;
            this.x += this.horizontalVelocity;
            this.y += this.verticalVelocity;
        } else {
            this.x += this.horizontalVelocity;
            this.y += this.verticalVelocity;
        }
        const remove = this.removeCheck();
        if (remove) {
            this.remove();
            return;
        }
    }
    this.draw();
    if (dots.dotsArray.length > 0) dots.entangleAndMergeCheck(index);
};

Dot.prototype.checkInertia = function() {
    return (Math.abs(this.horizontalVelocity) > Math.abs(this.targetHorizontalVelocity) && Math.abs(this.horizontalVelocity - this.targetHorizontalVelocity) > 0.1)
};

Dot.prototype.push = function() {
    let x;
    let y;
    [x, y] = mouse.calculateDrift(this.x, this.y);
    this.x += x;
    this.y += y;
    this.horizontalVelocity = x;
    this.verticalVelocity = y;
    this.targetHorizontalVelocity = x / mouse.intensityLimit;
    this.targetVerticalVelocity = x / mouse.intensityLimit;
};

Dot.prototype.draw = function() {
    const ctx = screen.context;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
};

Dot.prototype.removeCheck = function() {
    const outerRadius = this.radius * dots.outerRadiusMultiplier;
    const leftX = -outerRadius;
    const rightX = screen.canvas.width + outerRadius;
    const topY = -outerRadius;
    const bottomY = screen.canvas.height + outerRadius;
    return (this.x < leftX || this.x > rightX || this.y < topY || this.y > bottomY);
};

Dot.prototype.remove = function() {
    dots.dotsArray.splice(dots.dotsArray.indexOf(this), 1);
};

const dots = {
    maxBlurWidth: 3,
    outerRadiusMultiplier: 60,
    dotsArray: [],
    drifting: false,
    drip: function() {
        const poleVertical = (Math.random() < 0.5);
        const x = Math.floor(Math.random() * screen.canvas.width * 0.8 + screen.canvas.width * 0.1);
        const radius = this.randomRadius();
        const y = (poleVertical) ? -radius * this.outerRadiusMultiplier : radius * this.outerRadiusMultiplier + screen.canvas.height;
        const verticalVelocity = (poleVertical) ? this.randomVelocity() : -this.randomVelocity();
        const horizontalVelocity = this.randomVelocity()
        this.dotsArray.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
    },
    maximumDots: 15,
    dripCheck: function() {
        if (this.dripping && Math.random() < 0.1 && this.dotsArray.length < this.maximumDots) dots.drip();
    },
    dripping: false,
    adjust: function() {
        screen.context.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
        for (let i = this.dotsArray.length - 1; i >= 0; i--) {
            this.dotsArray[i].adjust(i);
        }
    },
    merge() {

    },
    entangleAndMergeCheck(index) {
        if (index > 0) {
            const currentDot = this.dotsArray[index];
            for (let i = index - 1; i >= 0; i--) {
                const nextDot = this.dotsArray[i];
                const outerRadius = (currentDot.radius > nextDot.radius) ? currentDot.radius * this.outerRadiusMultiplier : nextDot.radius * this.outerRadiusMultiplier;
                const hypotenuse = (((currentDot.x - nextDot.x) ** 2) + ((currentDot.y - nextDot.y) ** 2)) ** 0.5;
                if (hypotenuse < currentDot.radius + nextDot.radius) {
                    this.merge(currentDot, nextDot, outerRadius, hypotenuse);
                } else if (hypotenuse < outerRadius) {
                    this.entangle(currentDot, nextDot, outerRadius, hypotenuse);
                }
            }
        }
    },
    entangle(dot1, dot2, outerRadius, distance) {
        const intensity = outerRadius - distance;
        const width = (1 / outerRadius) * intensity * this.maxBlurWidth;
        const ctx = screen.context;
        ctx.shadowBlur = width * 100;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineTo(dot2.x, dot2.y);
        ctx.stroke();
    },
    minRadius: 1,
    radiusRange: 2,
    randomRadius() {
        return Math.ceil(this.minRadius + Math.random() * this.radiusRange);
    },
    randomVelocity() {
        return (Math.random() - 0.5) / 2;
    }
};

const mouse = {
    click(x, y) {
        const radius = dots.randomRadius();
        const verticalVelocity = dots.randomVelocity();
        const horizontalVelocity = dots.randomVelocity();
        dots.dotsArray.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
    },
    move(x, y) {
        this.coordinates.x = x;
        this.coordinates.y = y;
    },
    movable: false,
    coordinates: {
        reset() {
            delete this.x;
            delete this.y;
        }
    },
    proximityCheck(x, y, outerRadius) {
        const hypotenuse = (((this.coordinates.x - x) ** 2) + ((this.coordinates.y - y) ** 2)) ** 0.5;
        return (hypotenuse < outerRadius);
    },
    intensityLimit: 2,
    logslider(position, max) {
        const minp = 5;
        const maxp = 1;
        const minv = Math.log(0);
        const maxv = Math.log(max);
        const scale = (maxv - minv) / (maxp - minp);
        return Math.exp(minv + scale * (position - minp));
    },
    calculateDrift(x2, y2, outerRadius) {
        const x1 = this.coordinates.x;
        const y1 = this.coordinates.y;
        const xDiff = x1 - x2;
        const yDiff = y1 - y2;
        const hypotenuse = ((xDiff ** 2) + (yDiff ** 2)) ** 0.5;
        const intensity = this.intensityLimit / (outerRadius - hypotenuse);
        const unit = -this.intensityLimit / (Math.abs(xDiff) + Math.abs(yDiff));
        let x = unit * xDiff;
        let y = unit * yDiff;
        return [x, y];
    }
};

const screen = {
    ms: 50,
    resize(width, height) {
        const cnv = this.canvas;
        const ctx = this.context;
        cnv.width = width;
        cnv.height = height;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'white';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.shadowBlur = 0.5;
    },
    randomSeed(total = 0) {
        for (var i = 0; i < total; i++) {
            const x = Math.floor(Math.random() * this.canvas.width * 0.8);
            const y = Math.floor(Math.random() * this.canvas.height * 0.8);
            const radius = dots.randomRadius();
            const verticalVelocity = dots.randomVelocity();
            const horizontalVelocity = dots.randomVelocity();
            dots.dotsArray.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
        }
    },
    main() {
        dots.dripCheck();
        dots.adjust();
        mouse.coordinates.reset();
    }
};

screen.canvas = document.getElementById('entanglement-canvas');
screen.context = screen.canvas.getContext('2d');
screen.resize(innerWidth, innerHeight);
screen.context.lineCap = 'round';
screen.context.shadowColor = 'white';
screen.context.fillStyle = 'white';
screen.context.strokeStyle = 'white';
screen.loop = setInterval(screen.main, screen.ms);

window.addEventListener("resize", () => screen.resize(innerWidth, innerHeight));
document.addEventListener('mousemove', (e) => mouse.move(e.clientX, e.clientY));
document.addEventListener('click', (e) => mouse.click(e.clientX, e.clientY));

document.addEventListener("keyup", releasedKey);

function releasedKey(btn) {
    const key = btn.keyCode;
    if (key === 90) { // z
        dots.drifting = !dots.drifting;
    } else if (key === 88) { // x
        mouse.movable = ! mouse.movable;
    } else if (key === 67) { // c
        dots.dripping = !dots.dripping;
    } else if (key === 85) { // u
        dots.dotsArray.pop()
    } else if (key === 84) { // u
        screen.randomSeed(10);
    } else if (key === 82) { // u
        dots.dotsArray = [];
    }
}
