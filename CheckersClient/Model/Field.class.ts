module Model {
    export class Field {
        public x: number;
        public y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        public clone(): Field {
            return new Field(this.x, this.y);
        }

        public equals(field: Field) {
            return (this.x == field.x) && (this.y == field.y);
        }
    }
} 