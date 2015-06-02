module Model {
    /** Model pola */
    export class Field {
        /** Współrzędna x pola */
        public x: number;
        /** Współrzędna y pola */
        public y: number;

        /** 
         * Konstruktor pola
         * @param x Współrzędna x pola
         * @param y Współrzędna y pola
         */
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        /**
         * Metoda tworząca instancję-klona obiektu
         */
        public clone(): Field {
            return new Field(this.x, this.y);
        }

        /**
         * Metoda weryfikująca czy obiekty wskazują na to samo pole
         * (o tych samych współrzędnych)
         */
        public equals(field: Field) {
            return (this.x == field.x) && (this.y == field.y);
        }
    }
} 