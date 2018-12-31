function Dot(x, y, radius, verticalVelocity, horizontalVelocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.verticalVelocity = verticalVelocity;
    this.horizontalVelocity = horizontalVelocity;
    this.baseVerticalVelocity = verticalVelocity;
    this.baseHorizontalVelocity = horizontalVelocity;
}

Dot.prototype.adjust = function(index) {
    const outerRadius = this.radius * dot.outerRadiusMultiplier;
    if (mouse.coordinates.x && mouse.proximityCheck(this.x, this.y, outerRadius)) {
        let x;
        let y;
        [x, y] = mouse.calculateDrift(this.x, this.y);
        this.x += x;
        this.y += y;
        this.horizontalVelocity = x;
        this.verticalVelocity = y;
        this.baseHorizontalVelocity = x / mouse.intensityLimit;
        this.baseVerticalVelocity = y / mouse.intensityLimit;
    } else if (Math.abs(this.horizontalVelocity) > Math.abs(this.baseHorizontalVelocity) && Math.abs(this.horizontalVelocity - this.baseHorizontalVelocity) > 0.1) {
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
    } else {
        this.draw();
        if (dot.dots.length > 0) dot.entangleAndMergeCheck(index);
    }
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

const dot = {
    ms: 50,
    maxBlurWidth: 3,
    outerRadiusMultiplier: 60,
    dots: [],
    drip: function() {
        const poleVertical = (Math.random() < 0.5);
        const x = Math.floor(Math.random() * dot.canvas.width * 0.8 + dot.canvas.width * 0.1);
        const radius = this.randomRadius();
        const y = (poleVertical) ? -radius * this.outerRadiusMultiplier : radius * this.outerRadiusMultiplier + dot.canvas.height;
        const verticalVelocity = (poleVertical) ? this.randomVelocity() : -this.randomVelocity();
        const horizontalVelocity = this.randomVelocity()
        this.dots.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
    },
    maximumDots: 15,
    dripCheck: function() {
        if (Math.random() < 0.05 && this.dots.length < this.maximumDots) dot.drip();
    },
    adjust: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dots.reverse().forEach((cur, index) => cur.adjust(index));
    },
    merge() {

    },
    entangleAndMergeCheck(index) {
        if (index > 0) {
            const currentDot = this.dots[index];
            for (let i = index - 1; i >= 0; i--) {
                const nextDot = this.dots[i];
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
        const ctx = this.context;
        ctx.shadowBlur = width * 100;
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
        ctx.lineCap = 'round';
        ctx.shadowColor = 'white';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.shadowBlur = 0.5;
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
        const radius = dot.randomRadius();
        const verticalVelocity = dot.randomVelocity();
        const horizontalVelocity = dot.randomVelocity();
        dot.dots.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
    },
    move(x, y) {
        this.coordinates.x = x;
        this.coordinates.y = y;
    },
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
    function logslider(position) {
        // position will be between 0 and 100
        var minp = 0;
        var maxp = 100;

        // The result should be between 100 an 10000000
        var minv = Math.log(100);
        var maxv = Math.log(10000000);

        // calculate adjustment factor
        var scale = (maxv-minv) / (maxp-minp);

        return Math.exp(minv + scale*(position-minp));
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
}

function main() {
    dot.dripCheck();
    dot.adjust();
    mouse.coordinates.reset();
}

dot.canvas = document.getElementById('entanglement-canvas');
dot.context = dot.canvas.getContext('2d');
dot.resize(innerWidth, innerHeight);
dot.context.lineCap = 'round';
dot.context.shadowColor = 'white';
dot.context.fillStyle = 'white';
dot.context.strokeStyle = 'white';
dot.loop = setInterval(main, dot.ms);

window.addEventListener("resize", () => dot.resize(innerWidth, innerHeight));
document.addEventListener('mousemove', (e) => mouse.move(e.clientX, e.clientY));
document.addEventListener('click', (e) => mouse.click(e.clientX, e.clientY));

// must occur after initial resize
(function(total = 0) {
    for (var i = 0; i < total; i++) {
        const x = Math.floor(Math.random() * dot.canvas.width * 0.8);
        const y = Math.floor(Math.random() * dot.canvas.height * 0.8);
        const radius = dot.randomRadius();
        const verticalVelocity = dot.randomVelocity();
        const horizontalVelocity = dot.randomVelocity();
        dot.dots.push(new Dot(x, y, radius, verticalVelocity, horizontalVelocity));
    }
})();
