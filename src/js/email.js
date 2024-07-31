const TOKEN = `e520c17d-f28e-4154-bfe9-278c78f54fd4`

globalThis.sendRequestForAdsBlock = async (form) => {
    console.log(form["name"].value)
    const result = await Email.send({
        SecureToken : TOKEN,
        To : 'serhii@pimenov.com.ua',
        From : "site@trysusidy.kyiv.ua",
        Subject : "ОСББ Три сусіди 1 - Запит на створення об'яви",
        Body : `
    ФІО: ${form["name"].value}<br/>                               
    Телефон: ${form["tel"].value}<br/>                                
    Email: ${form["email"].value}<br/>
    -----------------------<br/>                                
    Назва: ${form["title"].value}<br/>
    Вартість: ${form["price"].value}<br/>                                
    Терміновість: ${form["urgently"].checked ? "Так" : "Ні"}<br/>
    -----------------------<br/>
    ${form["description"].value}<br/>
    -----------------------<br/>
    Лист відправлено з trysusidy.kiev.ua                                
        `
    })
    if (result.toLowerCase() === "ok") {
        Metro.toast.create("Дякуємо! Об1яву відправлено на розгляд адміністрації сайта.", {
            clsToast: "success",
            showTop: true,
        })
        setTimeout(() => {
            window.location.href="/ads"
        }, 2000)
    } else {
        Metro.toast.create(`Помилка! ${result}`, {
            clsToast: "alert",
            showTop: true,
        })
    }
}