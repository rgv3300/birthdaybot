export function isBirthdayToday(birthday: string): Boolean {
    const month = ["january","february","march","april","may","june","july",
            "august","september","october","november","december"];

    try {
        if (birthday) {
            const birthdayFormatted = birthday.trim().toLowerCase();
            const birthdayMonthAndDateSplit = birthdayFormatted.split(' ');
            const birthdayMonth = birthdayMonthAndDateSplit[0];
            const birthdayDay = birthdayMonthAndDateSplit[1];

            const today = new Date();
            return today.getDate().toString() === birthdayDay && birthdayMonth === month[today.getMonth()]; 
        }
     } catch (error) {
       console.log(error);
    }
    return false;
}