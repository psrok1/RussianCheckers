module Model {
    /**
     * Model rankingu
     */
    export class Rank {
        /** Najlepsze czasy */
        private times: number[] = [];

        /**
         * Aktualizacja rankingu
         * @param times Najlepsze czasy
         */
        public updateTimes(times: number[])
        {
            // Zaokrąglenie wartości
            for (var i = 0; i < times.length; i++)
                this.times[i] = Math.floor(this.times[i]);
            this.times = times.slice();
        }

        /**
         * Pobiera sformatowaną listę najlepszych czasów
         */
        public getFormattedTimes(): string[]
        {
            var formattedTimes: string[] = [];
            for (var i = 0; i < 5; i++) {
                if (i >= this.times.length)
                    formattedTimes.push("-");
                else {
                    var m = Math.floor(this.times[i] / 60)
                    var s = (this.times[i] % 60);
                    formattedTimes.push(
                        m +
                        ":" + (s<10 ? "0"+s : s));
                }
            }
            return formattedTimes;
        }
    }
} 