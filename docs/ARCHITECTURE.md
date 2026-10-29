# NutriPlan architecture

UML diagrams for the NutriPlan prototype. They render on GitHub and in VS Code's Markdown preview (with the recommended Mermaid extension). With `npm start` running, the same diagrams are at http://localhost:5173/docs/.

Sources live in `docs/uml/*.mmd`. After editing one, run `npm run uml` to refresh the SVG images.

## Contents

1. [Who does what](#who-does-what)
2. [Components in the browser](#components-in-the-browser)
3. [Data model](#data-model)
4. [Auto-fill the week, then shop](#auto-fill-the-week-then-shop)
5. [Weekly check-in](#weekly-check-in)
6. [Life of a meal slot](#life-of-a-meal-slot)
7. [Planned production setup](#planned-production-setup)

## Who does what

*Use case diagram.* The two actors: users plan, shop and track; care providers message, assign programs and review what users share.

```mermaid
%% Use case diagram: who does what in NutriPlan
flowchart LR
  user("User")
  pro("Care provider")
  uc1("Set goals and calorie target")
  uc2("Browse and search recipes")
  uc3("Find recipes from fridge ingredients")
  uc4("Plan the week / auto-fill")
  uc5("Mark meals as eaten")
  uc6("Generate shopping list")
  uc7("Ask Smart Chef")
  uc8("Message care team")
  uc9("Send weekly check-in")
  uc10("Book a session")
  uc11("Choose what to share")
  uc12("Assign program and habits")
  uc13("Review shared plans and check-ins")
  user --- uc1 & uc2 & uc3 & uc4 & uc5 & uc6 & uc7 & uc8 & uc9 & uc10 & uc11
  uc8 & uc10 & uc12 & uc13 --- pro
```

## Components in the browser

*Component diagram.* index.html loads app.js, which holds the router, the screens, the logic functions and the saved state. Content comes from data.js; state is saved in localStorage.

```mermaid
%% Component diagram: the prototype as it runs in the browser
flowchart TB
  subgraph browser["Browser"]
    html["index.html<br/>page shell, tab bar, chat, pop-up"]
    css["css/styles.css<br/>dark theme"]
    subgraph appjs["js/app.js"]
      router["Router<br/>show() · render() · ACT"]
      subgraph screens["Screens (VIEWS)"]
        direction LR
        s1["Home"]
        s2["Recipes"]
        s3["Planner"]
        s4["Shop"]
        s5["Care Team"]
        s6["Profile"]
        s7["Smart Chef"]
      end
      subgraph logic["Logic"]
        direction LR
        l1["recs()<br/>recommendations"]
        l2["autofill()"]
        l3["studio()<br/>ingredient matcher"]
        l4["shopList()<br/>list builder"]
        l5["targets()<br/>macro targets"]
        l6["chatReply()<br/>recipe search"]
      end
      state["State S<br/>defaults() · save()"]
    end
    data["js/data.js<br/>recipes · goals · care team"]
    ls[("localStorage<br/>nutriplan-v2")]
    photos[("photos/*.jpg")]
  end
  fonts["Google Fonts<br/>Young Serif · Figtree"]
  html --> appjs
  html --> css
  router --> screens
  screens --> logic
  logic --> state
  logic --> data
  state <--> ls
  screens --> photos
  css -.-> fonts
```

## Data model

*Class diagram.* Recipes own their ingredients and point to an optional photo and to health goals. The app state holds the meal plan, check-ins, sessions and message threads with providers.

```mermaid
%% Class diagram: the data model
classDiagram
  direction LR
  class Recipe {
    +string id
    +string name
    +string cuisine
    +string meal
    +number minutes
    +number kcal
    +number protein
    +number carbs
    +number fat
    +string[] goals
    +string[] steps
  }
  class Ingredient {
    +string quantity
    +string item
    +string aisle
  }
  class Photo {
    +string src
    +string photographer
    +string license
    +string url
  }
  class Goal {
    +string id
    +string label
    +string description
  }
  class AppState {
    +string[] goals
    +number kcalGoal
    +Map plan
    +Map eaten
    +Map shoppingTicks
    +save()
  }
  class MealSlot {
    +string date
    +string slot
    +string recipeId
    +bool eaten
  }
  class Provider {
    +string id
    +string name
    +string role
    +string[] canSee
  }
  class Message {
    +string from
    +string text
    +string time
  }
  class CheckIn {
    +string date
    +number weightKg
    +number sleepHours
    +number energy
    +string notes
  }
  class Session {
    +string providerId
    +datetime when
    +string format
  }
  class Workout {
    +string day
    +string name
    +number minutes
    +bool done
  }
  class Habit {
    +string name
    +bool[] week
  }
  Recipe "1" *-- "many" Ingredient : ingredients
  Recipe "1" --> "0..1" Photo : photo
  Recipe "many" --> "many" Goal : tagged with
  AppState "1" --> "many" Goal : selected
  AppState "1" *-- "many" MealSlot : plan
  MealSlot "many" --> "1" Recipe : uses
  AppState "1" *-- "many" CheckIn : check-ins
  AppState "1" *-- "many" Session : sessions
  AppState "1" *-- "many" Message : threads
  Message "many" --> "1" Provider : with
  Session "many" --> "1" Provider : with
  Provider "1" --> "many" Workout : assigns
  Provider "1" --> "many" Habit : sets
```

## Auto-fill the week, then shop

*Sequence diagram.* Auto-fill walks each empty slot from today, picks goal-matching recipes without repeats in a day, saves the plan, and the shopping list is built from it.

```mermaid
%% Sequence diagram: auto-fill the week, then build the shopping list
sequenceDiagram
  actor U as User
  participant P as Planner screen
  participant L as autofill()
  participant D as RECIPES (data.js)
  participant S as State S
  participant LS as localStorage
  participant Sh as Shop screen
  U->>P: Tap Auto-Fill Week
  P->>L: ACT.autofill
  loop each day from today, each empty slot
    L->>D: recipes for this meal type
    D-->>L: candidates
    L->>L: keep goal matches, skip repeats in the day
    L->>S: plan[day][slot] = recipe id
  end
  L-->>P: number of slots filled
  P->>S: render()
  S->>LS: save()
  P-->>U: Toast: filled N empty slots
  U->>P: Tap Shop This Week
  P->>Sh: go(shop)
  Sh->>S: shopList()
  S-->>Sh: ingredients merged by item, grouped by aisle
  Sh-->>U: Shopping list with tick boxes
```

## Weekly check-in

*Sequence diagram.* A check-in is validated, saved and charted. In production it would also be sent to the providers the user lets see check-ins.

```mermaid
%% Sequence diagram: weekly check-in shared with the care team
sequenceDiagram
  actor U as User
  participant C as Care Team screen
  participant S as State S
  participant LS as localStorage
  participant T as Care team
  U->>C: Enter weight, sleep, energy, notes
  U->>C: Tap Send check-in
  C->>C: submitCheckin() checks the numbers
  C->>S: add to checkins
  S->>LS: save()
  C-->>U: Toast and updated weight chart
  Note over S,T: Prototype: data stays on this device
  opt Production version
    S->>T: share with providers who can see Check-ins
    T-->>U: reply in Messages
  end
```

## Life of a meal slot

*State diagram.* A slot starts empty, becomes planned when a recipe is added, can be marked eaten, swapped or removed, and resets when the week is cleared.

```mermaid
%% State diagram: one meal slot in the planner
stateDiagram-v2
  direction LR
  [*] --> Empty
  Empty --> Planned: add meal or auto-fill
  Planned --> Planned: swap meal
  Planned --> Eaten: tick
  Eaten --> Planned: untick
  Planned --> Empty: remove or clear week
  Eaten --> Empty: remove or clear week
```

## Planned production setup

*Deployment diagram.* Mobile, web and provider apps talk to one API, which handles sign-in, the database, photos, messaging, the AI assistant and nutrition data.

```mermaid
%% Deployment diagram: planned production architecture
flowchart LR
  subgraph clients["Clients"]
    ios["iOS app"]
    android["Android app"]
    web["Web app"]
    portal["Provider portal"]
  end
  subgraph cloud["Cloud backend (planned)"]
    api["API server"]
    auth["Sign-in<br/>email · Google"]
    db[("Database<br/>users · plans · check-ins")]
    files[("File storage<br/>photos")]
    chat["Real-time messaging"]
    ai["AI service<br/>Smart Chef · fridge photos"]
    nutri["Nutrition data service"]
  end
  ios & android & web & portal --> api
  api --> auth
  api --> db
  api --> files
  api --> chat
  api --> ai
  api --> nutri
```

