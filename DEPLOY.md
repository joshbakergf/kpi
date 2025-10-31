
# Deploying to Google Cloud Run

This guide provides step-by-step instructions to deploy your containerized React application to Google Cloud Run.

## 1. Prerequisites

Before you begin, ensure you have the following installed and configured:
- **Google Cloud SDK (`gcloud`)**: [Installation Guide](https://cloud.google.com/sdk/docs/install)
- **Docker**: [Installation Guide](https://docs.docker.com/get-docker/) (must be running)
- A **Google Cloud Project** with billing enabled.

## 2. Local Setup & Sanity Check

First, ensure your application builds correctly locally.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server (Optional):**
    You can test the app locally. Create a `.env` file in the root of your project:
    ```
    API_KEY="your_gemini_api_key_here"
    ```
    Then run:
    ```bash
    npm run dev
    ```
    This will start a local server. Note that the API key is loaded from the `.env` file for local development only.

## 3. Google Cloud Project Setup

1.  **Set Your Project:**
    Replace `[YOUR_PROJECT_ID]` with your actual Google Cloud project ID.
    ```bash
    gcloud config set project [YOUR_PROJECT_ID]
    ```

2.  **Enable Required APIs:**
    This command enables the services we'll need for the deployment.
    ```bash
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
    ```

## 4. Create API Key Secret

We will use Google Secret Manager to securely store your Gemini API key. Cloud Run will access this secret at runtime.

1.  **Create the Secret:**
    ```bash
    gcloud secrets create gemini-api-key --replication-policy="automatic"
    ```

2.  **Add Your API Key as a Secret Version:**
    Replace `[YOUR_GEMINI_API_KEY]` with your actual key.
    ```bash
    echo -n "[YOUR_GEMINI_API_KEY]" | gcloud secrets versions add gemini-api-key --data-file=-
    ```

## 5. Build and Push the Container Image

We will use Google Cloud Build to build the Docker image and push it to Google Artifact Registry. This is more secure and efficient than building on your local machine.

1.  **Create an Artifact Registry Repository:**
    Replace `[REGION]` with your preferred Google Cloud region (e.g., `us-central1`).
    ```bash
    gcloud artifacts repositories create kpi-app-repo \
      --repository-format=docker \
      --location=[REGION] \
      --description="Docker repository for KPI review app"
    ```

2.  **Build the Image with Cloud Build:**
    This command tells Cloud Build to use your `Dockerfile` to build the image and tag it in your new Artifact Registry repository.
    ```bash
    gcloud builds submit --tag [REGION]-docker.pkg.dev/[YOUR_PROJECT_ID]/kpi-app-repo/kpi-review-app:latest
    ```

## 6. Deploy to Cloud Run

Now we deploy the container image to a new Cloud Run service.

1.  **Deploy the Service:**
    This command creates the service, points it to your container image, and securely injects the API key from Secret Manager as an environment variable.

    Replace `[REGION]` with the same region used before.
    ```bash
    gcloud run deploy kpi-review-app \
      --image [REGION]-docker.pkg.dev/[YOUR_PROJECT_ID]/kpi-app-repo/kpi-review-app:latest \
      --platform managed \
      --region [REGION] \
      --allow-unauthenticated \
      --set-secrets="API_KEY=gemini-api-key:latest"
    ```

    - `--allow-unauthenticated`: This makes your web app public. Remove this flag if you want to control access via IAM.
    - `--set-secrets`: This is the crucial step that maps the `gemini-api-key` secret to the `API_KEY` environment variable inside your Cloud Run container.

2.  **Grant Secret Access (If Prompted):**
    During the first deployment, `gcloud` may ask for permission to grant the Cloud Run service account access to the secret. Confirm `yes`. This allows your service to read the API key from Secret Manager.

## 7. Access Your Application

After the deployment completes, `gcloud` will provide you with a **Service URL**. You can now access your deployed application at that URL.

Congratulations, your KPI Review application is now live on Google Cloud Run!
