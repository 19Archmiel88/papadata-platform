# Konwencja lokalnych helpers Storybooka

Helper Storybooka jest dopuszczalny tylko wtedy, gdy nie tworzy nowego komponentu runtime.

## Kiedy helper

- Grupuje przykładowe dane tylko na potrzeby story.
- Ułatwia warianty dokumentacyjne bez eksportu z design systemu.
- Nie ma własnego kontraktu publicznego.
- Nie jest używany poza katalogiem story.

## Kiedy komponent

- Element ma być używany w runtime.
- Element ma własne props i odpowiedzialność produktową.
- Element pojawia się na wielu ekranach.
- Element wymaga wpisu w runtime API registry.

## Zakazy

- Helper nie może dublować istniejącego komponentu design systemu.
- Helper nie może definiować lokalnej palety.
- Helper nie może przejmować odpowiedzialności za stan danych z BFF.
