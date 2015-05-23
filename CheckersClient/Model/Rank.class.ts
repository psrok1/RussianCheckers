module Model {
    export class Rank {
        private times: number[] = [];

        public updateTimes(times: number[])
        {
            this.times = times.slice();
        }

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