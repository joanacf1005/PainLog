## PainLog

PainLog is an application for recording pain episodes, and related medication, allowing users to create, read, update, and delete structured pain entries. The goal is to support symptom tracking over time by centralizing the information in a secure API with Supabase authentication.

It helps monitor pain, medication, and health patterns over time. By organizing this data in one system, PainLog can support more informed health tracking and decision-making.

## Associated SDG

This project aligns with SDG 3 - Good Health and Well-Being, because it supports continuous tracking of pain and general health status. By helping users identify recurring symptoms, medication habits, and changes over time, the app encourages more informed self-monitoring and better well-being management.

## Homepage Screenshot

![Homepage screenshot](assets\resources\assetshomepage.jpeg)

## Tech Stack

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)

## About me

This project was developed as part of my final practical assignment for the "Laboratórios Práticos" UFCD. It gave me a chance to build a real-world solution with a clean interface and useful functionality.

## How to run locally

Clone the repository:
    https://github.com/joanacf1005/PainLog.git

Get into project folder:
    cd PainLog

Install dependencies:
    npm install 

Start the backend server:
    1. cd backend
    2. npm run build
    3. npm start

Create a `.env` file based on the `.env.example` file:
    Example variables:
    ```env
    SUPABASE_URL=
    SUPABASE_ANON_KEY=
    API_URL=
    ```

Start the frontend app:
    1. cd frontend/painlog-frontend
    3. ng serve --open

Production URL:
    https://painlog-frontend-k1s10ndo4-joanacf1005s-projects.vercel.app/login
    

## Implemented features

    • Daily pain entry logging.
    • Medication entry logging.
    • Today’s entry overview.
    • Edit existing entries.
    • Delete entries.
    • KPI cards with summary metrics.
    • Homepage with empty state and skeleton loading.
    • Authentication using Supabase.
    • Responsive UI for different screen sizes.

## Design Decision
 
One important design decision in this project was splitting the KPI cards into a separate component. This kept the homepage cleaner, reduced repetition, and made the UI easier to maintain and extend. It also helped separate data logic from presentation logic, which improves readability and scalability. The resources page is also made up of reusable cards so it can be used in multiple places without repeating logic.
