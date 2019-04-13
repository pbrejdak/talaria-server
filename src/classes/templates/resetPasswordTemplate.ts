export function resetPasswordTemplate(link: string, name: string, exp: Date): string {
    return (
        /* tslint:disable */
        `
        <html>
            <body>
                <header class="container-fluid">
                    <h1>Cześć, ${name}</h1>
                </header>
                <section class="container-fluid">
                    <p class="text-justify">
                    Poniżej znajdziesz odnośnik do strony, który pozwoli Ci zresetować hasło, jeśli jednak to to nie byłeś Ty, zingoruj tego maila. Link wygaśnie ${exp.toLocaleDateString()}.
                    </p>
                    <h1 class="link link-center"><a href="${link}" alt="Odnośnik do strony z resetowaniem hasła">${link}</a></h1>
                </section>
            </body>
        </html>
        `
    );
}
