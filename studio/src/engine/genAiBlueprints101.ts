/**
 * All 101 Official Real-World Gen AI Use Cases with Technical Blueprints from Google Cloud:
 * https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints
 *
 * Each entry includes:
 * - Official #1–#101 title & industry vertical
 * - Business challenge & Google Cloud tech stack
 * - Step-by-step architectural dataflow from the official blueprint
 * - Ready-to-render Google Cloud architecture diagram (CreateRequest)
 */
import type { BlueprintEntry } from "./catalog";

export const GEN_AI_101_BLUEPRINTS: BlueprintEntry[] = [
  {
    "id": "genai-bp-1",
    "title": "#1 \u00b7 Unify online and in-store retail experiences",
    "category": "Blueprint #1 \u00b7 Retail & E-Commerce",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a large retailer with valuable physical stores and a growing e-commerce channel. These two worlds operate in silos, creating a disconnected experience where customers face inconsistent pricing, promotions, and inventory levels. (Tech stack: Google Kubernetes Engine (GKE), BigQuery, Cloud CDN, Apigee, Cloud Spanner)",
    "dataflow": [
      "Customer traffic hits your e-commerce site",
      "Cloud CDN caches static content for speed",
      "GKE scales containerized e-commerce microservices based on demand",
      "Apigee manages APIs for real-time inventory checks against store-level data",
      "All sales data streams into BigQuery for supply chain analytics and demand forecasting"
    ],
    "keywords": [
      "1",
      "blueprint",
      "unify",
      "online",
      "and",
      "store",
      "retail",
      "experiences",
      "commerce",
      "google",
      "kubernetes",
      "engine",
      "gke",
      "bigquery",
      "cloud",
      "cdn",
      "apigee",
      "spanner"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #1: Unify online and in-store retail experiences using Google Kubernetes Engine (GKE), BigQuery, Cloud CDN, Apigee, Cloud Spanner",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#1 \u00b7 Unify online and in-store retail experiences",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (Google Kubernetes Engine (GKE), BigQuery, Cloud CDN, Apigee, Cloud Spanner)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "shoppers",
          "label": "Shoppers",
          "kind": "user"
        },
        {
          "id": "cdn",
          "label": "Static Content Cache",
          "kind": "network",
          "tech": "Cloud CDN",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gke",
          "label": "E-commerce Microservices",
          "kind": "container",
          "tech": "Google Kubernetes Engine",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "apigee",
          "label": "Inventory APIs",
          "kind": "gateway",
          "tech": "Apigee",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "spanner",
          "label": "Store-level Inventory",
          "kind": "database",
          "tech": "Cloud Spanner",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Supply Chain Analytics",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "shoppers",
          "to": "cdn",
          "label": "HTTPS"
        },
        {
          "from": "cdn",
          "to": "gke",
          "label": "dynamic requests"
        },
        {
          "from": "gke",
          "to": "apigee",
          "label": "real-time inventory check"
        },
        {
          "from": "apigee",
          "to": "spanner",
          "label": "store stock"
        },
        {
          "from": "gke",
          "to": "bq",
          "label": "sales stream",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-2",
    "title": "#2 \u00b7 Give your store managers ways to see real-time inventory",
    "category": "Blueprint #2 \u00b7 Retail & E-Commerce",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You want to boost efficiency by giving your store managers accurate, real-time inventory recommendations. (Tech stack: BigQuery, Vertex AI, Looker, Google Workspace)",
    "dataflow": [
      "Daily sales and inventory data from thousands of stores is ingested into BigQuery",
      "Vertex AI models process historical data to predict demand for each item",
      "Looker generates dashboards with recommended stock levels",
      "Recommendations are pushed to store associates' devices, often via a simple interface like Google Sheets"
    ],
    "keywords": [
      "2",
      "blueprint",
      "give",
      "your",
      "store",
      "managers",
      "ways",
      "see",
      "real",
      "time",
      "inventory",
      "retail",
      "commerce",
      "bigquery",
      "vertex",
      "looker",
      "google",
      "workspace"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #2: Give your store managers ways to see real-time inventory using BigQuery, Vertex AI, Looker, Google Workspace",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#2 \u00b7 Give your store managers ways to see real-time inventory",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (BigQuery, Vertex AI, Looker, Google Workspace)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "stores",
          "label": "Store Systems",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Sales & Inventory",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Demand Forecasting",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "looker",
          "label": "Stock Dashboards",
          "kind": "analytics",
          "tech": "Looker",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "sheets",
          "label": "Associate Devices",
          "kind": "client",
          "tech": "Google Sheets (Google Workspace)"
        }
      ],
      "edges": [
        {
          "from": "stores",
          "to": "bq",
          "label": "daily sales & inventory"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "historical data"
        },
        {
          "from": "vertex",
          "to": "looker",
          "label": "demand predictions"
        },
        {
          "from": "looker",
          "to": "sheets",
          "label": "recommended stock levels"
        }
      ]
    }
  },
  {
    "id": "genai-bp-3",
    "title": "#3 \u00b7 Make it easy for users to find and discover unique items on your online site",
    "category": "Blueprint #3 \u00b7 Retail & E-Commerce",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You have millions of unique, non-standard items needed to provide a highly relevant, fast, and personalized search experience for its users. (Tech stack: Google Cloud Storage, Dataflow, BigQuery, GKE)",
    "dataflow": [
      "A seller lists a new item, and its data is stored in Cloud Storage",
      "Dataflow processes item details and user interaction data in real-time",
      "This data enriches search indexes and feeds machine learning models running on GKE",
      "When a user searches, the models provide personalized rankings, which are served in milliseconds"
    ],
    "keywords": [
      "3",
      "blueprint",
      "make",
      "easy",
      "for",
      "users",
      "find",
      "and",
      "discover",
      "unique",
      "items",
      "your",
      "online",
      "site",
      "retail",
      "commerce",
      "google",
      "cloud",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #3: Make it easy for users to find and discover unique items on your online site using Google Cloud Storage, Dataflow, BigQuery, GKE",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#3 \u00b7 Make it easy for users to find and discover unique items on your online site",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (Google Cloud Storage, Dataflow, BigQuery, GKE)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "sellers",
          "label": "Sellers",
          "kind": "user"
        },
        {
          "id": "gcs",
          "label": "Item Listings",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "df",
          "label": "Real-time Processing",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Items & Interactions",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gke",
          "label": "Search & Ranking Models",
          "kind": "container",
          "tech": "Google Kubernetes Engine",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "shoppers",
          "label": "Shoppers",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "sellers",
          "to": "gcs",
          "label": "new item"
        },
        {
          "from": "gcs",
          "to": "df",
          "label": "item details"
        },
        {
          "from": "shoppers",
          "to": "df",
          "label": "interactions",
          "style": "dashed"
        },
        {
          "from": "df",
          "to": "bq",
          "label": "enriched data"
        },
        {
          "from": "bq",
          "to": "gke",
          "label": "index & features"
        },
        {
          "from": "shoppers",
          "to": "gke",
          "label": "search \u2192 ranked results"
        }
      ]
    }
  },
  {
    "id": "genai-bp-4",
    "title": "#4 \u00b7 Modernize in-store operations with AI",
    "category": "Blueprint #4 \u00b7 Retail & E-Commerce",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You\u2019re a retailer who needs to digitize and streamline legacy, paper-based processes for store associates to improve productivity and customer service. (Tech stack: Vertex AI Vision, GKE, Android, ChromeOS)",
    "dataflow": [
      "An associate uses a mobile device to scan a product shelf",
      "Vertex AI Vision analyzes the image to identify products and price tags",
      "An application, running on GKE, cross-references this with inventory data",
      "The device displays inventory status, ordering needs, or planogram compliance information"
    ],
    "keywords": [
      "4",
      "blueprint",
      "modernize",
      "store",
      "operations",
      "with",
      "retail",
      "commerce",
      "vertex",
      "vision",
      "gke",
      "android",
      "chromeos"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #4: Modernize in-store operations with AI using Vertex AI Vision, GKE, Android, ChromeOS",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#4 \u00b7 Modernize in-store operations with AI",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (Vertex AI Vision, GKE, Android, ChromeOS)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "associate",
          "label": "Store Associate",
          "kind": "user"
        },
        {
          "id": "device",
          "label": "Android / ChromeOS Device",
          "kind": "mobile",
          "tech": "Android, ChromeOS"
        },
        {
          "id": "vision",
          "label": "Shelf Image Analysis",
          "kind": "ai",
          "tech": "Vertex AI Vision",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gke",
          "label": "Store Operations App",
          "kind": "container",
          "tech": "Google Kubernetes Engine",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "inventory",
          "label": "Inventory Data",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "associate",
          "to": "device",
          "label": "scans shelf"
        },
        {
          "from": "device",
          "to": "vision",
          "label": "shelf image"
        },
        {
          "from": "vision",
          "to": "gke",
          "label": "products & price tags"
        },
        {
          "from": "gke",
          "to": "inventory",
          "label": "cross-reference"
        },
        {
          "from": "gke",
          "to": "device",
          "label": "stock & planogram status",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-5",
    "title": "#5 \u00b7 Create an assistant for a better shopping experience",
    "category": "Blueprint #5 \u00b7 Retail & E-Commerce",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a brand whose traditional support channels, like text-based chatbots and FAQs, feel impersonal, can't visually guide customers through complex processes, and might not create a genuine connection with your audience. (Tech stack: Vertex AI, Google Cloud Storage (for 3D assets), GKE (for hosting and scaling), Speech-to-Text & Text-to-Speech APIs)",
    "dataflow": [
      "A customer asks a troubleshooting question in your app (e.g., \"How do I replace the water filter in my coffee machine?\")",
      "The request (voice or text) is sent to the conversational AI \"brain\" on Vertex AI, which identifies the intent",
      "The AI generates a text response and identifies the corresponding visual aid (e.g., filter_replacement_step1.mp4)",
      "A service on GKE retrieves this video clip from Google Cloud Storage",
      "The app displays the text and plays the short video, visually guiding the customer through the process and resolving their issue quickly"
    ],
    "keywords": [
      "5",
      "blueprint",
      "create",
      "assistant",
      "for",
      "better",
      "shopping",
      "experience",
      "retail",
      "commerce",
      "vertex",
      "google",
      "cloud",
      "storage",
      "assets",
      "gke",
      "hosting",
      "and",
      "scaling"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #5: Create an assistant for a better shopping experience using Vertex AI, Google Cloud Storage (for 3D assets), GKE (for hosting and scaling), Speech-to-Text & Text-to-Speech APIs",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#5 \u00b7 Create an assistant for a better shopping experience",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (Vertex AI, Google Cloud Storage (for 3D assets), GKE (for hosting and scaling), Speech-to-Text & Text-to-Speech APIs)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "customer",
          "label": "Customer",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Support App",
          "kind": "mobile"
        },
        {
          "id": "gke",
          "label": "Assistant Backend",
          "kind": "container",
          "tech": "Google Kubernetes Engine",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "stt",
          "label": "Voice Input",
          "kind": "ai",
          "tech": "Speech-to-Text",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Conversational AI",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "tts",
          "label": "Voice Answer",
          "kind": "ai",
          "tech": "Text-to-Speech",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gcs",
          "label": "3D & Video Assets",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "customer",
          "to": "app",
          "label": "troubleshooting question"
        },
        {
          "from": "app",
          "to": "gke",
          "label": "voice or text"
        },
        {
          "from": "gke",
          "to": "stt",
          "label": "audio"
        },
        {
          "from": "gke",
          "to": "vertex",
          "label": "intent & answer"
        },
        {
          "from": "gke",
          "to": "tts",
          "label": "spoken reply"
        },
        {
          "from": "gke",
          "to": "gcs",
          "label": "visual aid clip"
        }
      ]
    }
  },
  {
    "id": "genai-bp-6",
    "title": "#6 \u00b7 Write differentiated product descriptions",
    "category": "Blueprint #6 \u00b7 Retail & E-Commerce",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You\u2019re a large e-commerce retailer that needs to create unique, high-quality, and SEO-friendly product descriptions for thousands of items at scale, reducing manual effort and avoiding duplicate content. (Tech stack: Vertex AI, Cloud Run, BigQuery)",
    "dataflow": [
      "A merchandiser inputs key product attributes (e.g., material, color, target audience) into a product management tool",
      "These attributes are sent to a service on Cloud Run",
      "The service constructs a detailed prompt and calls the Vertex AI Generative AI API",
      "Vertex AI analyzes the attributes and returns multiple unique description options",
      "The descriptions are displayed to the merchandiser for review, editing, and final approval"
    ],
    "keywords": [
      "6",
      "blueprint",
      "write",
      "differentiated",
      "product",
      "descriptions",
      "retail",
      "commerce",
      "vertex",
      "cloud",
      "run",
      "bigquery"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #6: Write differentiated product descriptions using Vertex AI, Cloud Run, BigQuery",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#6 \u00b7 Write differentiated product descriptions",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (Vertex AI, Cloud Run, BigQuery)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "merch",
          "label": "Merchandiser",
          "kind": "user"
        },
        {
          "id": "pim",
          "label": "Product Management Tool",
          "kind": "external"
        },
        {
          "id": "run",
          "label": "Description Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Description Generator",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Product Catalog Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "merch",
          "to": "pim",
          "label": "key attributes"
        },
        {
          "from": "pim",
          "to": "run",
          "label": "attributes"
        },
        {
          "from": "run",
          "to": "vertex",
          "label": "detailed prompt"
        },
        {
          "from": "run",
          "to": "bq",
          "label": "descriptions for review",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-7",
    "title": "#7 \u00b7 Help users find your products using photos as a reference",
    "category": "Blueprint #7 \u00b7 Retail & E-Commerce",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You want to make it easy for your customers to find desired inventory (e.g. clothing) using a photo as a reference. (Tech stack: Vertex AI Vision, Vector Search, Google Cloud Storage, Cloud Run)",
    "dataflow": [
      "A customer uploads a reference photo in the app",
      "The app sends the photo to a service on Cloud Run",
      "The service uses Vertex AI Vision to convert the photo into a vector embedding",
      "This embedding is used to query the Vector Search, which finds the most visually similar product embeddings from the indexed catalog",
      "The service returns the matching products to the customer in seconds"
    ],
    "keywords": [
      "7",
      "blueprint",
      "help",
      "users",
      "find",
      "your",
      "products",
      "using",
      "photos",
      "reference",
      "retail",
      "commerce",
      "vertex",
      "vision",
      "vector",
      "search",
      "google",
      "cloud",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #7: Help users find your products using photos as a reference using Vertex AI Vision, Vector Search, Google Cloud Storage, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#7 \u00b7 Help users find your products using photos as a reference",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (Vertex AI Vision, Vector Search, Google Cloud Storage, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "customer",
          "label": "Customer",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Shopping App",
          "kind": "mobile"
        },
        {
          "id": "run",
          "label": "Visual Search Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vision",
          "label": "Photo Embedding",
          "kind": "ai",
          "tech": "Vertex AI Vision",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vs",
          "label": "Product Embedding Index",
          "kind": "ai",
          "tech": "Vertex AI Vector Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gcs",
          "label": "Product Images",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "customer",
          "to": "app",
          "label": "reference photo"
        },
        {
          "from": "app",
          "to": "run",
          "label": "photo"
        },
        {
          "from": "run",
          "to": "vision",
          "label": "embed photo"
        },
        {
          "from": "run",
          "to": "vs",
          "label": "most similar products"
        },
        {
          "from": "gcs",
          "to": "vs",
          "label": "indexed catalog",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-8",
    "title": "#8 \u00b7 Build a real-time product recommendation engine",
    "category": "Blueprint #8 \u00b7 Retail & E-Commerce",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a digital retailer trying to increase basket size and customer loyalty. Traditional recommendation engines are too simplistic, often failing to understand a customer's true intent or style beyond basic keywords. This leads to generic suggestions, poor discoverability for unique items in your catalog, and frustrated shoppers who abandon their carts, causing you to leave significant revenue on the table. (Tech stack: BigQuery, Vector Search, Dataflow, Cloud Run)",
    "dataflow": [
      "User clickstream data streams into Dataflow",
      "Dataflow processes and enriches these events, updating user profiles and embeddings in real-time (in BigQuery or a feature store)",
      "As a user browses, a request is sent to a service on Cloud Run",
      "The service queries Vector Search with the user's embedding to find the most relevant or complementary items",
      "A personalized list of products is returned and displayed to the user in milliseconds"
    ],
    "keywords": [
      "8",
      "blueprint",
      "build",
      "real",
      "time",
      "product",
      "recommendation",
      "engine",
      "retail",
      "commerce",
      "bigquery",
      "vector",
      "search",
      "dataflow",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #8: Build a real-time product recommendation engine using BigQuery, Vector Search, Dataflow, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#8 \u00b7 Build a real-time product recommendation engine",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (BigQuery, Vector Search, Dataflow, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "shoppers",
          "label": "Shoppers",
          "kind": "user"
        },
        {
          "id": "df",
          "label": "Clickstream Processing",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Profiles & Embeddings",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "run",
          "label": "Recommendation Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vs",
          "label": "Item Embedding Index",
          "kind": "ai",
          "tech": "Vertex AI Vector Search",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "shoppers",
          "to": "df",
          "label": "clickstream",
          "style": "dashed"
        },
        {
          "from": "df",
          "to": "bq",
          "label": "profiles & embeddings"
        },
        {
          "from": "shoppers",
          "to": "run",
          "label": "browsing request"
        },
        {
          "from": "run",
          "to": "bq",
          "label": "user embedding"
        },
        {
          "from": "run",
          "to": "vs",
          "label": "complementary items"
        }
      ]
    }
  },
  {
    "id": "genai-bp-9",
    "title": "#9 \u00b7 Quickly identify trends and improve customer interactions",
    "category": "Blueprint #9 \u00b7 Retail & E-Commerce",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "Your valuable feedback is buried in thousands of rows of unstructured text from surveys, reviews, and support tickets. Manually reading, tagging, and categorizing this data is a slow and tedious process that delays critical insights and prevents your team from quickly reacting to emerging trends or urgent issue (Tech stack: Google Sheets, Gemini for Google Workspace, Google Forms (as a data source))",
    "dataflow": [
      "Customer feedback is collected from sources like Google Forms and consolidated into a Google Sheet",
      "An analyst highlights the column of raw feedback and uses the integrated Gemini feature with a prompt like \"Categorize this feedback\"",
      "Gemini processes the text in each cell and populates a new column with the corresponding categories",
      "The analyst can then create charts and pivot tables on this newly structured data to identify trends"
    ],
    "keywords": [
      "9",
      "blueprint",
      "quickly",
      "identify",
      "trends",
      "and",
      "improve",
      "customer",
      "interactions",
      "retail",
      "commerce",
      "google",
      "sheets",
      "gemini",
      "for",
      "workspace",
      "forms",
      "data",
      "source"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #9: Quickly identify trends and improve customer interactions using Google Sheets, Gemini for Google Workspace, Google Forms (as a data source)",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#9 \u00b7 Quickly identify trends and improve customer interactions",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (Google Sheets, Gemini for Google Workspace, Google Forms (as a data source))",
      "groups": [
        {
          "id": "ws",
          "label": "Google Workspace",
          "kind": "boundary"
        }
      ],
      "nodes": [
        {
          "id": "customers",
          "label": "Customers",
          "kind": "user"
        },
        {
          "id": "forms",
          "label": "Feedback Form",
          "kind": "client",
          "tech": "Google Forms",
          "group": "ws"
        },
        {
          "id": "sheets",
          "label": "Feedback Sheet",
          "kind": "client",
          "tech": "Google Sheets",
          "group": "ws"
        },
        {
          "id": "gemini",
          "label": "Gemini in Sheets",
          "kind": "ai",
          "tech": "Gemini for Google Workspace",
          "provider": "gcp",
          "group": "ws"
        },
        {
          "id": "analyst",
          "label": "Analyst",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "customers",
          "to": "forms",
          "label": "feedback"
        },
        {
          "from": "forms",
          "to": "sheets",
          "label": "responses"
        },
        {
          "from": "analyst",
          "to": "gemini",
          "label": "\"Categorize this feedback\""
        },
        {
          "from": "gemini",
          "to": "sheets",
          "label": "category column, charts"
        }
      ]
    }
  },
  {
    "id": "genai-bp-10",
    "title": "#10 \u00b7 Compare vendor proposals, right from your email",
    "category": "Blueprint #10 \u00b7 Retail & E-Commerce",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a buyer or department head responsible for making purchasing decisions. But complex vendor proposals arrive in different formats, burying key details like costs, timelines, and deliverables across dozens of pages. Manually creating a comparison is slow, tedious, and prone to human error, creating the risk that you'll miss a critical detail and make a costly decision. (Tech stack: Gmail, Gemini for Google Workspace)",
    "dataflow": [
      "A buyer receives multiple emails with vendor proposals as attachments (PDFs, Docs, etc.)",
      "In the Gmail thread, the user activates Gemini and provides a prompt like, \"Create a table comparing the cost, timeline, and key deliverables from the attached proposals\"",
      "Gemini reads the context of the emails and the content of the attachments",
      "It generates a concise summary and a comparison table directly in the Gmail interface",
      "The buyer can then make a faster, more informed decision without manually cross-referencing documents"
    ],
    "keywords": [
      "10",
      "blueprint",
      "compare",
      "vendor",
      "proposals",
      "right",
      "from",
      "your",
      "email",
      "retail",
      "commerce",
      "gmail",
      "gemini",
      "for",
      "google",
      "workspace"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #10: Compare vendor proposals, right from your email using Gmail, Gemini for Google Workspace",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#10 \u00b7 Compare vendor proposals, right from your email",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (Gmail, Gemini for Google Workspace)",
      "groups": [
        {
          "id": "ws",
          "label": "Google Workspace",
          "kind": "boundary"
        }
      ],
      "nodes": [
        {
          "id": "vendors",
          "label": "Vendors",
          "kind": "external"
        },
        {
          "id": "gmail",
          "label": "Proposal Emails",
          "kind": "email",
          "tech": "Gmail",
          "group": "ws"
        },
        {
          "id": "gemini",
          "label": "Gemini in Gmail",
          "kind": "ai",
          "tech": "Gemini for Google Workspace",
          "provider": "gcp",
          "group": "ws"
        },
        {
          "id": "buyer",
          "label": "Buyer",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "vendors",
          "to": "gmail",
          "label": "proposals (PDFs, Docs)"
        },
        {
          "from": "gmail",
          "to": "gemini",
          "label": "thread & attachments"
        },
        {
          "from": "buyer",
          "to": "gemini",
          "label": "comparison prompt \u2192 summary & table"
        }
      ]
    }
  },
  {
    "id": "genai-bp-11",
    "title": "#11 \u00b7 Merge and duplicate product listings",
    "category": "Blueprint #11 \u00b7 Retail & E-Commerce",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Retail & E-Commerce"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an e-commerce catalog manager responsible for a massive product catalog sourced from multiple vendors. Inconsistent data creates countless duplicate listings for the same item. This clutters the customer experience, splits your inventory and sales data (making accurate forecasting impossible) and harms your search rankings, all while your team spends countless hours manually trying to find and merge them. (Tech stack: BigQuery, Vertex AI, Dataflow)",
    "dataflow": [
      "Product catalog data is processed by a data processing pipeline (Dataflow)",
      "Dataflow calls a Vertex AI model to convert product text and images into vector embeddings",
      "The embeddings are stored in BigQuery",
      "A BigQuery ML clustering model groups items with similar embeddings into duplicate sets",
      "These duplicate sets are sent to a review dashboard or an automated merging service"
    ],
    "keywords": [
      "11",
      "blueprint",
      "merge",
      "and",
      "duplicate",
      "product",
      "listings",
      "retail",
      "commerce",
      "bigquery",
      "vertex",
      "dataflow"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #11: Merge and duplicate product listings using BigQuery, Vertex AI, Dataflow",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#11 \u00b7 Merge and duplicate product listings",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Retail & E-Commerce (BigQuery, Vertex AI, Dataflow)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "feeds",
          "label": "Vendor Catalog Feeds",
          "kind": "external"
        },
        {
          "id": "df",
          "label": "Catalog Pipeline",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Text & Image Embeddings",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Embeddings & BigQuery ML Clustering",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "review",
          "label": "Review Dashboard / Merge Service",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "feeds",
          "to": "df",
          "label": "product data"
        },
        {
          "from": "df",
          "to": "vertex",
          "label": "text & images"
        },
        {
          "from": "df",
          "to": "bq",
          "label": "embeddings"
        },
        {
          "from": "bq",
          "to": "review",
          "label": "duplicate sets"
        }
      ]
    }
  },
  {
    "id": "genai-bp-12",
    "title": "#12 \u00b7 Summarize commentary into podcasts",
    "category": "Blueprint #12 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a broadcaster or sports league with hours of live commentary for each event. Manually creating highlight reels, summaries, or daily podcasts is time-consuming, labor-intensive, and slow, causing you to miss opportunities for timely fan engagement. (Tech stack: Google Cloud Speech-to-Text, Vertex AI, Cloud Functions, and Google Cloud Storage)",
    "dataflow": [
      "Live audio commentary is captured and stored in Google Cloud Storage",
      "A Cloud Function is triggered, which sends the audio file to the Speech-to-Text API to generate a full, time-stamped transcript",
      "The transcript is sent to a Vertex AI generative model with a prompt like, \"Identify the top 5 most exciting moments from this race transcript based on exclamation, keywords (e.g., 'overtake', 'crash'), and sentiment. For each moment, create a 30-second summary script\"",
      "The generated podcast script is then sent to a text-to-speech engine or a human host to be recorded, creating a \"daily highlights\" podcast in minutes instead of hours"
    ],
    "keywords": [
      "12",
      "blueprint",
      "summarize",
      "commentary",
      "into",
      "podcasts",
      "media",
      "entertainment",
      "gaming",
      "google",
      "cloud",
      "speech",
      "text",
      "vertex",
      "functions",
      "and",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #12: Summarize commentary into podcasts using Google Cloud Speech-to-Text, Vertex AI, Cloud Functions, and Google Cloud Storage",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#12 \u00b7 Summarize commentary into podcasts",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (Google Cloud Speech-to-Text, Vertex AI, Cloud Functions, and Google Cloud Storage)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "commentary",
          "label": "Live Commentary",
          "kind": "external"
        },
        {
          "id": "gcs",
          "label": "Audio Recordings",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "fn",
          "label": "Highlights Function",
          "kind": "function",
          "tech": "Cloud Run functions",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "stt",
          "label": "Transcription",
          "kind": "ai",
          "tech": "Speech-to-Text",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Highlight Script Writer",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "voice",
          "label": "TTS Engine or Host",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "commentary",
          "to": "gcs",
          "label": "audio files"
        },
        {
          "from": "gcs",
          "to": "fn",
          "label": "new file",
          "style": "dashed"
        },
        {
          "from": "fn",
          "to": "stt",
          "label": "audio"
        },
        {
          "from": "fn",
          "to": "vertex",
          "label": "time-stamped transcript"
        },
        {
          "from": "fn",
          "to": "voice",
          "label": "podcast script"
        }
      ]
    }
  },
  {
    "id": "genai-bp-13",
    "title": "#13 \u00b7 Build a content recommendation engine",
    "category": "Blueprint #13 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a sports franchise or media company that has consolidated all of its fan data into a unified data foundation. You want to deliver relevant, personalized content to every fan\u2014including real-time game highlights, scores, and alerts about ticket sales or events\u2014to deepen engagement and increase revenue. (Tech stack: BigQuery, Vertex AI Search, Vector Search, Dataflow, and Cloud Run)",
    "dataflow": [
      "Real-time fan interactions and game data (scores, stats) stream into Pub/Sub",
      "A Dataflow pipeline processes and enriches this data, updating fan profiles in the BigQuery unified data foundation",
      "Vertex AI uses this historical and real-time data to train a recommendation model",
      "When a fan uses the team's app, a request is sent to a service on Cloud Run",
      "The service queries Vertex AI Vertex AI Search with the fan's ID, which returns a personalized list of content (highlights, articles, ticket alerts)",
      "The app displays the personalized recommendations to the fan in real time"
    ],
    "keywords": [
      "13",
      "blueprint",
      "build",
      "content",
      "recommendation",
      "engine",
      "media",
      "entertainment",
      "gaming",
      "bigquery",
      "vertex",
      "search",
      "vector",
      "dataflow",
      "and",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #13: Build a content recommendation engine using BigQuery, Vertex AI Search, Vector Search, Dataflow, and Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#13 \u00b7 Build a content recommendation engine",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (BigQuery, Vertex AI Search, Vector Search, Dataflow, and Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "fans",
          "label": "Fans",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Team App",
          "kind": "mobile"
        },
        {
          "id": "ps",
          "label": "Fan & Game Events",
          "kind": "queue",
          "tech": "Pub/Sub",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "df",
          "label": "Stream Enrichment",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Unified Fan Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Recommendation Model",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "run",
          "label": "Content Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "search",
          "label": "Personalized Content",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vs",
          "label": "Content Embeddings",
          "kind": "ai",
          "tech": "Vertex AI Vector Search",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "fans",
          "to": "app",
          "label": "opens app"
        },
        {
          "from": "app",
          "to": "ps",
          "label": "interactions & scores",
          "style": "dashed"
        },
        {
          "from": "ps",
          "to": "df",
          "label": "events"
        },
        {
          "from": "df",
          "to": "bq",
          "label": "fan profiles"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "training data"
        },
        {
          "from": "vertex",
          "to": "search",
          "label": "trained model",
          "style": "dashed"
        },
        {
          "from": "app",
          "to": "run",
          "label": "fan ID"
        },
        {
          "from": "run",
          "to": "search",
          "label": "personalized content"
        },
        {
          "from": "search",
          "to": "vs",
          "label": "similar content"
        }
      ]
    }
  },
  {
    "id": "genai-bp-14",
    "title": "#14 \u00b7 Create ultra-personalized media campaigns",
    "category": "Blueprint #14 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You want to move beyond generic marketing and create deeply personal, shareable moments for every single user. (Tech stack: BigQuery, Vertex AI, Dataflow, Cloud Run, and Google Cloud Storage)",
    "dataflow": [
      "A large-scale Dataflow pipeline processes a year's worth of user interaction data from BigQuery to calculate personalized stats for each user",
      "For each user, a service on Cloud Run sends their top stats (e.g., favorite artist, most-played song) to the Gemini API with a prompt like, \"Generate a fun, upbeat script for a podcast summarizing these listening habits\"",
      "The Cloud Run service uses the generated text to create personalized assets (audio clips, social media images) and stores them in Google Cloud Storage",
      "When the user opens their app, it fetches their unique, pre-generated assets from Cloud Storage to deliver their personalized experience"
    ],
    "keywords": [
      "14",
      "blueprint",
      "create",
      "ultra",
      "personalized",
      "media",
      "campaigns",
      "entertainment",
      "gaming",
      "bigquery",
      "vertex",
      "dataflow",
      "cloud",
      "run",
      "and",
      "google",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #14: Create ultra-personalized media campaigns using BigQuery, Vertex AI, Dataflow, Cloud Run, and Google Cloud Storage",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#14 \u00b7 Create ultra-personalized media campaigns",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (BigQuery, Vertex AI, Dataflow, Cloud Run, and Google Cloud Storage)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "bq",
          "label": "Listening History",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "df",
          "label": "Yearly Stats Pipeline",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "run",
          "label": "Asset Generator",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Script Writer",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gcs",
          "label": "Personalized Assets",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "listeners",
          "label": "Listeners",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Listener App",
          "kind": "mobile"
        }
      ],
      "edges": [
        {
          "from": "bq",
          "to": "df",
          "label": "a year of interactions"
        },
        {
          "from": "df",
          "to": "run",
          "label": "top stats per user"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "podcast script prompt"
        },
        {
          "from": "run",
          "to": "gcs",
          "label": "audio clips & images"
        },
        {
          "from": "listeners",
          "to": "app",
          "label": "opens app"
        },
        {
          "from": "app",
          "to": "gcs",
          "label": "pre-generated assets"
        }
      ]
    }
  },
  {
    "id": "genai-bp-15",
    "title": "#15 \u00b7 Build an AI captioning tool",
    "category": "Blueprint #15 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a major media company with a massive archive of video content. Your challenge is making this content accessible and searchable by creating accurate, time-stamped captions and transcripts, a process that is incredibly slow and expensive to do manually. (Tech stack: Google Cloud Storage, Speech-to-Text API, Vertex AI, Cloud Functions)",
    "dataflow": [
      "A video file is uploaded to Google Cloud Storage",
      "A Cloud Function triggers and sends the video's audio track to the Speech-to-Text API, specifying a model trained for media content",
      "The API returns a detailed, time-stamped transcript",
      "For added context, the transcript can be sent to a Gemini model with a prompt like, \"Identify the different speakers in this transcript and label their lines,\" providing a rich, searchable, and accessible caption file"
    ],
    "keywords": [
      "15",
      "blueprint",
      "build",
      "captioning",
      "tool",
      "media",
      "entertainment",
      "gaming",
      "google",
      "cloud",
      "storage",
      "speech",
      "text",
      "api",
      "vertex",
      "functions"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #15: Build an AI captioning tool using Google Cloud Storage, Speech-to-Text API, Vertex AI, Cloud Functions",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#15 \u00b7 Build an AI captioning tool",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (Google Cloud Storage, Speech-to-Text API, Vertex AI, Cloud Functions)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "team",
          "label": "Media Team",
          "kind": "user"
        },
        {
          "id": "gcs",
          "label": "Video Archive",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "fn",
          "label": "Caption Function",
          "kind": "function",
          "tech": "Cloud Run functions",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "stt",
          "label": "Media Transcription",
          "kind": "ai",
          "tech": "Speech-to-Text",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Speaker Labelling",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "team",
          "to": "gcs",
          "label": "video upload"
        },
        {
          "from": "gcs",
          "to": "fn",
          "label": "new video",
          "style": "dashed"
        },
        {
          "from": "fn",
          "to": "stt",
          "label": "audio track"
        },
        {
          "from": "fn",
          "to": "gemini",
          "label": "transcript \u2192 captions"
        }
      ]
    }
  },
  {
    "id": "genai-bp-16",
    "title": "#16 \u00b7 Write social media captions",
    "category": "Blueprint #16 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a sports league or broadcaster with hours of event footage. Your challenge is quickly creating engaging social media clips to capitalize on exciting moments, a process that requires a social media manager to manually watch footage, select a clip, and write a caption. (Tech stack: Gemini for Google Drive, Google Drive)",
    "dataflow": [
      "All broadcast footage from an event is saved to a shared folder in Google Drive",
      "A social media manager opens the Gemini in Drive side panel",
      "They use a prompt like, \"Analyze the video files in this folder from the last hour. Find the top 3 most exciting moments based on commentary and crowd noise. For each, suggest a 5-second video clip and write three different engaging social media captions with relevant hashtags.\"",
      "Gemini provides the clips and captions directly in the Drive interface, turning an hours-long task into a single prompt"
    ],
    "keywords": [
      "16",
      "blueprint",
      "write",
      "social",
      "media",
      "captions",
      "entertainment",
      "gaming",
      "gemini",
      "for",
      "google",
      "drive"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #16: Write social media captions using Gemini for Google Drive, Google Drive",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#16 \u00b7 Write social media captions",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (Gemini for Google Drive, Google Drive)",
      "groups": [
        {
          "id": "ws",
          "label": "Google Workspace",
          "kind": "boundary"
        }
      ],
      "nodes": [
        {
          "id": "footage",
          "label": "Broadcast Footage",
          "kind": "external"
        },
        {
          "id": "drive",
          "label": "Shared Event Folder",
          "kind": "client",
          "tech": "Google Drive",
          "group": "ws"
        },
        {
          "id": "gemini",
          "label": "Gemini in Drive",
          "kind": "ai",
          "tech": "Gemini for Google Drive",
          "provider": "gcp",
          "group": "ws"
        },
        {
          "id": "manager",
          "label": "Social Media Manager",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "footage",
          "to": "drive",
          "label": "event videos"
        },
        {
          "from": "drive",
          "to": "gemini",
          "label": "video files"
        },
        {
          "from": "manager",
          "to": "gemini",
          "label": "top moments prompt \u2192 clips & captions"
        }
      ]
    }
  },
  {
    "id": "genai-bp-17",
    "title": "#17 \u00b7 Create hundreds of hyper-personalized video and audio ad variations in minutes",
    "category": "Blueprint #17 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a digital advertising platform, and your clients want to move beyond one-size-fits-all ads. Your challenge is creating hundreds of personalized ad variations tailored to different audiences, a task that is prohibitively expensive and slow using traditional production methods. (Tech stack: Vertex AI, Text-to-Speech API, Cloud Run, BigQuery)",
    "dataflow": [
      "An advertiser defines a campaign with multiple target audience segments stored in BigQuery (e.g., \"young professionals,\" \"college students\")",
      "For each segment, a service on Cloud Run calls the Gemini API with a prompt like, \"Generate a 15-second audio ad script for a new coffee brand, targeting 'young professionals'. The tone should be sophisticated and energetic.\"",
      "Gemini generates a unique script for each audience",
      "The scripts are sent to the Text-to-Speech API to create audio voiceovers in various styles",
      "These audio files are combined with background music, creating hundreds of personalized ad variations in minutes"
    ],
    "keywords": [
      "17",
      "blueprint",
      "create",
      "hundreds",
      "hyper",
      "personalized",
      "video",
      "and",
      "audio",
      "variations",
      "minutes",
      "media",
      "entertainment",
      "gaming",
      "vertex",
      "text",
      "speech",
      "api",
      "cloud"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #17: Create hundreds of hyper-personalized video and audio ad variations in minutes using Vertex AI, Text-to-Speech API, Cloud Run, BigQuery",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#17 \u00b7 Create hundreds of hyper-personalized video and audio ad variations in minutes",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (Vertex AI, Text-to-Speech API, Cloud Run, BigQuery)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "advertiser",
          "label": "Advertiser",
          "kind": "user"
        },
        {
          "id": "bq",
          "label": "Audience Segments",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "run",
          "label": "Ad Variation Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Ad Script Writer",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "tts",
          "label": "Voiceovers",
          "kind": "ai",
          "tech": "Text-to-Speech",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "advertiser",
          "to": "bq",
          "label": "campaign segments"
        },
        {
          "from": "bq",
          "to": "run",
          "label": "each segment"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "script prompt"
        },
        {
          "from": "run",
          "to": "tts",
          "label": "scripts \u2192 audio"
        }
      ]
    }
  },
  {
    "id": "genai-bp-18",
    "title": "#18 \u00b7 Gen AI photo-editing and design",
    "category": "Blueprint #18 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a franchise business and you need to create high-quality, professional marketing materials for hundreds of local branches. Your challenge is that local owners are not graphic designers, and hiring designers for every local ad is not scalable. (Tech stack: Vertex AI, Google Cloud Storage, a custom marketing portal (built on App Engine or Cloud Run))",
    "dataflow": [
      "A local studio owner logs into a central marketing portal",
      "They upload a photo of their students to Google Cloud Storage",
      "The portal provides an editing interface powered by Imagen 3, Google's image generation model",
      "The owner can use simple prompts like, \"Extend the background of this photo to fit a vertical social media post,\" or \"Create a dynamic 'new student special' graphic using this photo.\"",
      "The AI generates professional-quality, on-brand marketing assets, empowering local franchises to create their own materials without design expertise"
    ],
    "keywords": [
      "18",
      "blueprint",
      "gen",
      "photo",
      "editing",
      "and",
      "design",
      "media",
      "entertainment",
      "gaming",
      "vertex",
      "google",
      "cloud",
      "storage",
      "custom",
      "marketing",
      "portal",
      "built",
      "app"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #18: Gen AI photo-editing and design using Vertex AI, Google Cloud Storage, a custom marketing portal (built on App Engine or Cloud Run)",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#18 \u00b7 Gen AI photo-editing and design",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (Vertex AI, Google Cloud Storage, a custom marketing portal (built on App Engine or Cloud Run))",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "owner",
          "label": "Studio Owner",
          "kind": "user"
        },
        {
          "id": "portal",
          "label": "Marketing Portal",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gcs",
          "label": "Uploaded Photos",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "imagen",
          "label": "Image Editing",
          "kind": "ai",
          "tech": "Imagen on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "owner",
          "to": "portal",
          "label": "photo & prompt"
        },
        {
          "from": "portal",
          "to": "gcs",
          "label": "store photo"
        },
        {
          "from": "portal",
          "to": "imagen",
          "label": "edit prompt"
        },
        {
          "from": "imagen",
          "to": "gcs",
          "label": "marketing assets",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-19",
    "title": "#19 \u00b7 Search data across tens of thousands of courses",
    "category": "Blueprint #19 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a large media or education company with tens of thousands of courses, articles, and learning materials. Your challenge is helping users find the specific information they need when it's buried across this massive and diverse content library. (Tech stack: Vertex AI Search, BigQuery, Google Cloud Storage)",
    "dataflow": [
      "All course content, including text, videos, and metadata, is indexed from sources like Google Cloud Storage and BigQuery into Vertex AI Search",
      "A user goes to the learning platform and uses a natural language search query like, \"I want to learn about the basics of financial modeling in spreadsheets, but I only have 30 minutes.\"",
      "Vertex AI Search understands the multiple intents (topic, format, duration) and queries across the entire catalog",
      "It returns a ranked list of the most relevant results, such as a specific 10-minute video lecture and a 20-minute practical exercise, providing a much more relevant result than a simple keyword search"
    ],
    "keywords": [
      "19",
      "blueprint",
      "search",
      "data",
      "across",
      "tens",
      "thousands",
      "courses",
      "media",
      "entertainment",
      "gaming",
      "vertex",
      "bigquery",
      "google",
      "cloud",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #19: Search data across tens of thousands of courses using Vertex AI Search, BigQuery, Google Cloud Storage",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#19 \u00b7 Search data across tens of thousands of courses",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (Vertex AI Search, BigQuery, Google Cloud Storage)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "gcs",
          "label": "Course Videos & Files",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Course Metadata",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "search",
          "label": "Course Search",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "learners",
          "label": "Learners",
          "kind": "user"
        },
        {
          "id": "platform",
          "label": "Learning Platform",
          "kind": "client"
        }
      ],
      "edges": [
        {
          "from": "gcs",
          "to": "search",
          "label": "index content",
          "style": "dashed"
        },
        {
          "from": "bq",
          "to": "search",
          "label": "index metadata",
          "style": "dashed"
        },
        {
          "from": "learners",
          "to": "platform",
          "label": "natural-language query"
        },
        {
          "from": "platform",
          "to": "search",
          "label": "query \u2192 ranked results"
        }
      ]
    }
  },
  {
    "id": "genai-bp-20",
    "title": "#20 \u00b7 Make video content generation faster",
    "category": "Blueprint #20 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a company creating AI-powered video content, such as digital avatars or automated news reports. Your challenge is the immense computational power required to render high-quality video quickly, which can create a bottleneck and slow down your entire production pipeline. (Tech stack: Cloud GPUs (or TPUs), Google Kubernetes Engine (GKE), Google Cloud Storage)",
    "dataflow": [
      "A user submits a script and selects a digital avatar for a new video",
      "The request is sent to a rendering application running on a GKE cluster",
      "GKE automatically scales up a pool of nodes equipped with powerful Cloud GPUs",
      "The GPUs work in parallel to process the AI models and render the video frames at high speed",
      "Once rendering is complete, the final video file is saved to Google Cloud Storage, and the GPU-powered nodes scale down automatically, optimizing for both speed and cost"
    ],
    "keywords": [
      "20",
      "blueprint",
      "make",
      "video",
      "content",
      "generation",
      "faster",
      "media",
      "entertainment",
      "gaming",
      "cloud",
      "gpus",
      "tpus",
      "google",
      "kubernetes",
      "engine",
      "gke",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #20: Make video content generation faster using Cloud GPUs (or TPUs), Google Kubernetes Engine (GKE), Google Cloud Storage",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#20 \u00b7 Make video content generation faster",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (Cloud GPUs (or TPUs), Google Kubernetes Engine (GKE), Google Cloud Storage)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "creator",
          "label": "Creator",
          "kind": "user"
        },
        {
          "id": "gke",
          "label": "Rendering Service",
          "kind": "container",
          "tech": "Google Kubernetes Engine",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gpu",
          "label": "Autoscaled GPU Node Pool",
          "kind": "server",
          "tech": "Cloud GPUs",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gcs",
          "label": "Rendered Videos",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "creator",
          "to": "gke",
          "label": "script & avatar"
        },
        {
          "from": "gke",
          "to": "gpu",
          "label": "render jobs"
        },
        {
          "from": "gpu",
          "to": "gcs",
          "label": "final video"
        }
      ]
    }
  },
  {
    "id": "genai-bp-21",
    "title": "#21 \u00b7 Create a recommendations experience",
    "category": "Blueprint #21 \u00b7 Media, Entertainment & Gaming",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Media, Entertainment & Gaming"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a major broadcaster with a huge catalog of content, from live sports to soap operas. Your challenge is to keep viewers engaged by surfacing content that is personally relevant to them from across your entire diverse portfolio, rather than just showing them what's popular. (Tech stack: BigQuery, Vertex AI, Dataflow, Cloud Run)",
    "dataflow": [
      "Real-time viewer interaction data streams into a Dataflow pipeline, which processes the events and updates viewer profiles in BigQuery",
      "The unified viewer data in BigQuery is used to train a Vertex AI Vertex AI Search model",
      "When a viewer opens the streaming app, a request is sent to a service on Cloud Run",
      "The service queries the Vertex AI Search model with the viewer's ID",
      "The model returns a personalized list of content, such as \"Because you watched the soccer match, you might also like this sports documentary,\" creating a highly engaging and personalized experience"
    ],
    "keywords": [
      "21",
      "blueprint",
      "create",
      "recommendations",
      "experience",
      "media",
      "entertainment",
      "gaming",
      "bigquery",
      "vertex",
      "dataflow",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #21: Create a recommendations experience using BigQuery, Vertex AI, Dataflow, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#21 \u00b7 Create a recommendations experience",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Media, Entertainment & Gaming (BigQuery, Vertex AI, Dataflow, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "viewers",
          "label": "Viewers",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Streaming App",
          "kind": "client"
        },
        {
          "id": "df",
          "label": "Viewer Events",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Viewer Profiles",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "search",
          "label": "Recommendation Model",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "run",
          "label": "Recommendation API",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "viewers",
          "to": "app",
          "label": "opens app"
        },
        {
          "from": "app",
          "to": "df",
          "label": "viewing events",
          "style": "dashed"
        },
        {
          "from": "df",
          "to": "bq",
          "label": "profiles"
        },
        {
          "from": "bq",
          "to": "search",
          "label": "training data",
          "style": "dashed"
        },
        {
          "from": "app",
          "to": "run",
          "label": "viewer ID"
        },
        {
          "from": "run",
          "to": "search",
          "label": "recommendations"
        }
      ]
    }
  },
  {
    "id": "genai-bp-22",
    "title": "#22 \u00b7 Build an AI-powered interactive owner's manual",
    "category": "Blueprint #22 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an automaker or manufacturer of complex products. Your challenge is that traditional paper owner's manuals are cumbersome, difficult to search, and rarely used by customers, leading to frustration and increased calls to support centers for simple questions. (Tech stack: Vertex AI, AlloyDB for PostgreSQL, Cloud Run, Google Cloud Storage)",
    "dataflow": [
      "All owner's manual content is processed and chunked into vector embeddings, which are stored in AlloyDB",
      "When a driver uses the app to ask a question like, \"How do I change a flat tire?\", and the query is sent to a service on Cloud Run",
      "For multimodal queries, the user points their phone's camera at a dashboard light; the image is sent to Vertex AI Vision to identify it, and this information is added to the query",
      "The service finds the most relevant manual sections from AlloyDB and sends them, along with the user's question, to Gemini, which generates a clear, conversational answer"
    ],
    "keywords": [
      "22",
      "blueprint",
      "build",
      "powered",
      "interactive",
      "owner",
      "manual",
      "automotive",
      "supply",
      "chain",
      "logistics",
      "vertex",
      "alloydb",
      "for",
      "postgresql",
      "cloud",
      "run",
      "google",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #22: Build an AI-powered interactive owner's manual using Vertex AI, AlloyDB for PostgreSQL, Cloud Run, Google Cloud Storage",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#22 \u00b7 Build an AI-powered interactive owner's manual",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (Vertex AI, AlloyDB for PostgreSQL, Cloud Run, Google Cloud Storage)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "gcs",
          "label": "Owner's Manual Content",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "emb",
          "label": "Chunk Embeddings",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "alloy",
          "label": "Manual Vectors",
          "kind": "database",
          "tech": "AlloyDB for PostgreSQL",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "driver",
          "label": "Driver",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Owner App",
          "kind": "mobile"
        },
        {
          "id": "run",
          "label": "Manual Assistant",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vision",
          "label": "Dashboard Light Recognition",
          "kind": "ai",
          "tech": "Vertex AI Vision",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Answer Generation",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "gcs",
          "to": "emb",
          "label": "chunks"
        },
        {
          "from": "emb",
          "to": "alloy",
          "label": "vector embeddings"
        },
        {
          "from": "driver",
          "to": "app",
          "label": "question or camera photo"
        },
        {
          "from": "app",
          "to": "run",
          "label": "query"
        },
        {
          "from": "run",
          "to": "vision",
          "label": "dashboard photo"
        },
        {
          "from": "run",
          "to": "alloy",
          "label": "vector search"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "sections + question"
        }
      ]
    }
  },
  {
    "id": "genai-bp-23",
    "title": "#23 \u00b7 Monitor real-time audio for in-transit safety alerts",
    "category": "Blueprint #23 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "security",
    "icon": "security",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a transportation or logistics company responsible for the safety of thousands of drivers and passengers every day. Your challenge is reacting to dangerous situations quickly enough, as traditional methods rely on passengers or drivers manually triggering an alarm, which is often too late. (Tech stack: Speech-to-Text API, Vertex AI, Pub/Sub, Cloud Functions)",
    "dataflow": [
      "During a trip, audio from the vehicle is streamed in chunks to Pub/Sub",
      "A Cloud Function is triggered, which sends the audio snippet to the Speech-to-Text API for transcription",
      "The resulting text is sent to a Gemini model with a prompt like, \"Analyze this text for keywords related to distress or hostility ('robbery', 'help'). Return a 'Red' alert if found, otherwise 'Green'.\"",
      "If a 'Red' alert is returned, the system automatically notifies a central security dashboard with the trip details and vehicle location"
    ],
    "keywords": [
      "23",
      "blueprint",
      "monitor",
      "real",
      "time",
      "audio",
      "for",
      "transit",
      "safety",
      "alerts",
      "automotive",
      "supply",
      "chain",
      "logistics",
      "speech",
      "text",
      "api",
      "vertex",
      "pub"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #23: Monitor real-time audio for in-transit safety alerts using Speech-to-Text API, Vertex AI, Pub/Sub, Cloud Functions",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#23 \u00b7 Monitor real-time audio for in-transit safety alerts",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (Speech-to-Text API, Vertex AI, Pub/Sub, Cloud Functions)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "vehicle",
          "label": "Vehicle Audio",
          "kind": "external"
        },
        {
          "id": "ps",
          "label": "Audio Chunks",
          "kind": "queue",
          "tech": "Pub/Sub",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "fn",
          "label": "Safety Check",
          "kind": "function",
          "tech": "Cloud Run functions",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "stt",
          "label": "Transcription",
          "kind": "ai",
          "tech": "Speech-to-Text",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Distress Classifier",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "dash",
          "label": "Security Dashboard",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "vehicle",
          "to": "ps",
          "label": "audio stream"
        },
        {
          "from": "ps",
          "to": "fn",
          "label": "each chunk",
          "style": "dashed"
        },
        {
          "from": "fn",
          "to": "stt",
          "label": "audio snippet"
        },
        {
          "from": "fn",
          "to": "gemini",
          "label": "transcript \u2192 Red / Green"
        },
        {
          "from": "fn",
          "to": "dash",
          "label": "Red alert + location"
        }
      ]
    }
  },
  {
    "id": "genai-bp-24",
    "title": "#24 \u00b7 Deploy dynamic, location-aware digital advertising",
    "category": "Blueprint #24 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "Your company has a large mobile physical presence (like a fleet of trucks) and you want to move beyond displaying static logos. Your challenge is creating advertising that is hyper-relevant and context-aware, to capture the attention of people in specific neighborhoods with unique messaging. (Tech stack: Gemini, Google Maps Platform (Geocoding API), Cloud Run, BigQuery)",
    "dataflow": [
      "A device on a truck periodically sends its GPS coordinates to a service on Cloud Run",
      "The service calls the Google Maps Geocoding API to identify the current neighborhood and queries BigQuery for demographic or local interest data associated with that area",
      "These details are used to construct a prompt for Gemini, such as \"Create a witty, 10-word billboard headline for a moving company in a neighborhood known for its young families and parks.\"",
      "Gemini returns multiple headline options, and the service displays the best one on the truck's digital billboard in real time"
    ],
    "keywords": [
      "24",
      "blueprint",
      "deploy",
      "dynamic",
      "location",
      "aware",
      "digital",
      "advertising",
      "automotive",
      "supply",
      "chain",
      "logistics",
      "gemini",
      "google",
      "maps",
      "platform",
      "geocoding",
      "api",
      "cloud"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #24: Deploy dynamic, location-aware digital advertising using Gemini, Google Maps Platform (Geocoding API), Cloud Run, BigQuery",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#24 \u00b7 Deploy dynamic, location-aware digital advertising",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (Gemini, Google Maps Platform (Geocoding API), Cloud Run, BigQuery)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "truck",
          "label": "Truck GPS Device",
          "kind": "external"
        },
        {
          "id": "run",
          "label": "Billboard Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "maps",
          "label": "Neighborhood Lookup",
          "kind": "api",
          "tech": "Google Maps Platform (Geocoding API)",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Local Demographics",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Headline Writer",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "billboard",
          "label": "Digital Billboard",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "truck",
          "to": "run",
          "label": "GPS coordinates"
        },
        {
          "from": "run",
          "to": "maps",
          "label": "geocode"
        },
        {
          "from": "run",
          "to": "bq",
          "label": "local interests"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "headline prompt"
        },
        {
          "from": "run",
          "to": "billboard",
          "label": "best headline"
        }
      ]
    }
  },
  {
    "id": "genai-bp-25",
    "title": "#25 \u00b7 Build a productivity agent for customer service teams",
    "category": "Blueprint #25 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a large enterprise with a customer service team that handles thousands of interactions daily. Your agents spend significant time writing summaries instead of focusing on high-quality problem-solving. (Tech stack: Vertex AI, BigQuery, Cloud Functions)",
    "dataflow": [
      "All customer service interactions (chats, emails) are stored in a central data store like BigQuery",
      "When an agent opens a new ticket, a Cloud Function is triggered",
      "The function retrieves the customer's entire interaction history from BigQuery and sends it to Gemini with a prompt like, \"Summarize the key issues from this customer's past 5 interactions and list their current sentiment.\"",
      "The concise summary appears directly in the agent's CRM, allowing them to understand the full context in seconds and provide a more effective and empathetic response"
    ],
    "keywords": [
      "25",
      "blueprint",
      "build",
      "productivity",
      "agent",
      "for",
      "customer",
      "service",
      "teams",
      "automotive",
      "supply",
      "chain",
      "logistics",
      "vertex",
      "bigquery",
      "cloud",
      "functions"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #25: Build a productivity agent for customer service teams using Vertex AI, BigQuery, Cloud Functions",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#25 \u00b7 Build a productivity agent for customer service teams",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (Vertex AI, BigQuery, Cloud Functions)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "interactions",
          "label": "Chats & Emails",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Interaction History",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "agent",
          "label": "Service Agent",
          "kind": "user"
        },
        {
          "id": "crm",
          "label": "CRM",
          "kind": "external"
        },
        {
          "id": "fn",
          "label": "Ticket Summarizer",
          "kind": "function",
          "tech": "Cloud Run functions",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Summary & Sentiment",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "interactions",
          "to": "bq",
          "label": "stored"
        },
        {
          "from": "agent",
          "to": "crm",
          "label": "opens ticket"
        },
        {
          "from": "crm",
          "to": "fn",
          "label": "new ticket",
          "style": "dashed"
        },
        {
          "from": "fn",
          "to": "bq",
          "label": "customer history"
        },
        {
          "from": "fn",
          "to": "gemini",
          "label": "summarize prompt"
        },
        {
          "from": "fn",
          "to": "crm",
          "label": "summary in the ticket",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-26",
    "title": "#26 \u00b7 Analyze large-scale telematics data for fleet optimization",
    "category": "Blueprint #26 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a global logistics or telematics company managing millions of connected vehicles. Your challenge is processing the immense volume of daily data points that can help you improve fleet efficiency, driver safety, and sustainability. (Tech stack: BigQuery, Vertex AI, Looker)",
    "dataflow": [
      "Billions of data points from millions of vehicles stream directly into BigQuery daily",
      "BigQuery ML uses that data to train models directly within the data warehouse to identify patterns related to fuel consumption, unsafe driving habits, or optimal routing",
      "The models run continuously, analyzing new data as it arrives and outputting insights such as \"vehicles on Route 88 are experiencing 15% higher fuel consumption due to traffic patterns.\"",
      "These insights are visualized in a Looker dashboard, allowing fleet managers to make informed decisions on routing, driver training, and vehicle maintenance"
    ],
    "keywords": [
      "26",
      "blueprint",
      "analyze",
      "large",
      "scale",
      "telematics",
      "data",
      "for",
      "fleet",
      "optimization",
      "automotive",
      "supply",
      "chain",
      "logistics",
      "bigquery",
      "vertex",
      "looker"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #26: Analyze large-scale telematics data for fleet optimization using BigQuery, Vertex AI, Looker",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#26 \u00b7 Analyze large-scale telematics data for fleet optimization",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (BigQuery, Vertex AI, Looker)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "vehicles",
          "label": "Vehicle Telematics",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Telematics Warehouse",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bqml",
          "label": "Fuel, Safety & Route Models",
          "kind": "ai",
          "tech": "BigQuery ML",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Model Registry & Serving",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "looker",
          "label": "Fleet Dashboard",
          "kind": "analytics",
          "tech": "Looker",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "managers",
          "label": "Fleet Managers",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "vehicles",
          "to": "bq",
          "label": "billions of data points"
        },
        {
          "from": "bq",
          "to": "bqml",
          "label": "training data"
        },
        {
          "from": "bqml",
          "to": "vertex",
          "label": "registered models",
          "style": "dashed"
        },
        {
          "from": "bqml",
          "to": "looker",
          "label": "insights"
        },
        {
          "from": "managers",
          "to": "looker",
          "label": "routing & training decisions"
        }
      ]
    }
  },
  {
    "id": "genai-bp-27",
    "title": "#27 \u00b7 Create an AI-powered supply chain risk intelligence platform",
    "category": "Blueprint #27 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a global enterprise with a complex, multi-tiered supply chain. Your challenge is a lack of visibility into potential disruptions \u2014 from financial instability and labor issues to geopolitical events \u2014 deep within your supplier network, putting you at risk of costly delays and compliance failures. (Tech stack: Gemini, Pub/Sub, BigQuery)",
    "dataflow": [
      "The system continuously ingests data from public sources (news, social media, financial reports) via Pub/Sub",
      "This data, along with a company's internal supplier data, is stored and processed in BigQuery",
      "Gemini models analyze the unstructured text data, performing sentiment analysis and entity recognition to identify potential risks associated with specific suppliers (e.g., \"news reports indicate labor strikes at Factory X\" )",
      "The system generates a risk score for each supplier, which is updated in real-time on a dashboard, alerting managers to potential disruptions before they impact the supply chain"
    ],
    "keywords": [
      "27",
      "blueprint",
      "create",
      "powered",
      "supply",
      "chain",
      "risk",
      "intelligence",
      "platform",
      "automotive",
      "logistics",
      "gemini",
      "pub",
      "sub",
      "bigquery"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #27: Create an AI-powered supply chain risk intelligence platform using Gemini, , Pub/Sub, BigQuery",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#27 \u00b7 Create an AI-powered supply chain risk intelligence platform",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (Gemini, Pub/Sub, BigQuery)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "sources",
          "label": "News, Social & Financial Reports",
          "kind": "external"
        },
        {
          "id": "ps",
          "label": "Public Data Ingestion",
          "kind": "queue",
          "tech": "Pub/Sub",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "suppliers",
          "label": "Internal Supplier Data",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Supplier Risk Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Sentiment & Entity Analysis",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "dash",
          "label": "Risk Dashboard",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "sources",
          "to": "ps",
          "label": "feeds"
        },
        {
          "from": "ps",
          "to": "bq",
          "label": "stream"
        },
        {
          "from": "suppliers",
          "to": "bq",
          "label": "supplier records"
        },
        {
          "from": "bq",
          "to": "gemini",
          "label": "unstructured text"
        },
        {
          "from": "gemini",
          "to": "dash",
          "label": "supplier risk scores"
        }
      ]
    }
  },
  {
    "id": "genai-bp-28",
    "title": "#28 \u00b7 Build a digital twin of your distribution network",
    "category": "Blueprint #28 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a logistics and shipping company operating a vast, complex network of vehicles, warehouses, and sorting facilities. Your challenge is a lack of a single, real-time view of your entire operation, making it difficult to optimize routes, predict delays, and provide customers with accurate tracking information. (Tech stack: Pub/Sub, Dataflow, BigQuery, Vertex AI, Google Maps Platform)",
    "dataflow": [
      "IoT sensors on packages, vehicles, and in facilities stream real-time location and status data to Pub/Sub",
      "A Dataflow pipeline processes this massive stream of data, cleansing and structuring it before loading it into BigQuery",
      "Vertex AI models use this historical and real-time data to run thousands of simulations, predicting potential bottlenecks and optimizing routes",
      "The entire network state is visualized on a Google Maps Platform interface, creating a \"digital twin\" that allows operators to see the entire network at a glance and customers to track their packages with pinpoint accuracy"
    ],
    "keywords": [
      "28",
      "blueprint",
      "build",
      "digital",
      "twin",
      "your",
      "distribution",
      "network",
      "automotive",
      "supply",
      "chain",
      "logistics",
      "pub",
      "sub",
      "dataflow",
      "bigquery",
      "vertex",
      "google",
      "maps"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #28: Build a digital twin of your distribution network using Pub/Sub, Dataflow, BigQuery, Vertex AI, Google Maps Platform",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#28 \u00b7 Build a digital twin of your distribution network",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (Pub/Sub, Dataflow, BigQuery, Vertex AI, Google Maps Platform)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "iot",
          "label": "IoT Sensors",
          "kind": "external"
        },
        {
          "id": "ps",
          "label": "Location & Status Stream",
          "kind": "queue",
          "tech": "Pub/Sub",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "df",
          "label": "Stream Cleansing",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Network History",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Route Simulations",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "maps",
          "label": "Digital Twin Map",
          "kind": "api",
          "tech": "Google Maps Platform",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "people",
          "label": "Operators & Customers",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "iot",
          "to": "ps",
          "label": "real-time telemetry"
        },
        {
          "from": "ps",
          "to": "df",
          "label": "events"
        },
        {
          "from": "df",
          "to": "bq",
          "label": "structured data"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "historical & live data"
        },
        {
          "from": "vertex",
          "to": "maps",
          "label": "bottlenecks & routes"
        },
        {
          "from": "people",
          "to": "maps",
          "label": "network view, tracking"
        }
      ]
    }
  },
  {
    "id": "genai-bp-29",
    "title": "#29 \u00b7 Optimize industrial planning with 3D digital twins",
    "category": "Blueprint #29 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a manufacturer with complex factory layouts and supply chains. Your challenge is that optimizing facility design, production line flow, or warehouse logistics is incredibly difficult and expensive to test in the physical world. (Tech stack: Vertex AI, a 3D modeling engine, Google Cloud Storage)",
    "dataflow": [
      "Factory assets are scanned using mobile devices or drones, capturing thousands of images",
      "The images are uploaded to Google Cloud Storage and processed by Vertex AI Vision models to identify objects and their dimensions",
      "This structured data is fed into a 3D modeling engine to create a photorealistic digital twin of the facility",
      "Planners can then use this digital twin to run thousands of simulations with Gemini, asking questions like \"What is the most efficient path for a robot to move from station A to station B?\" to optimize processes virtually before committing to expensive physical changes"
    ],
    "keywords": [
      "29",
      "blueprint",
      "optimize",
      "industrial",
      "planning",
      "with",
      "digital",
      "twins",
      "automotive",
      "supply",
      "chain",
      "logistics",
      "vertex",
      "modeling",
      "engine",
      "google",
      "cloud",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #29: Optimize industrial planning with 3D digital twins using Vertex AI, a 3D modeling engine, Google Cloud Storage",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#29 \u00b7 Optimize industrial planning with 3D digital twins",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (Vertex AI, a 3D modeling engine, Google Cloud Storage)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "drones",
          "label": "Drones & Mobile Scans",
          "kind": "mobile"
        },
        {
          "id": "gcs",
          "label": "Facility Images",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vision",
          "label": "Object & Dimension Detection",
          "kind": "ai",
          "tech": "Vertex AI Vision",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "engine3d",
          "label": "3D Modeling Engine",
          "kind": "external"
        },
        {
          "id": "gemini",
          "label": "Planning Simulations",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "planners",
          "label": "Planners",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "drones",
          "to": "gcs",
          "label": "thousands of images"
        },
        {
          "from": "gcs",
          "to": "vision",
          "label": "images"
        },
        {
          "from": "vision",
          "to": "engine3d",
          "label": "objects & dimensions"
        },
        {
          "from": "engine3d",
          "to": "gemini",
          "label": "digital twin"
        },
        {
          "from": "planners",
          "to": "gemini",
          "label": "what-if questions"
        }
      ]
    }
  },
  {
    "id": "genai-bp-30",
    "title": "#30 \u00b7 Bring your employees up to speed on AI",
    "category": "Blueprint #30 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a manufacturing company with a wealth of operational knowledge about the factory floor, but your expert workers lack the coding skills to build AI solutions. Your challenge is finding a way to make it easy to give your frontline teams ways to solve their own problems with AI, so they can improve efficiency and quality control. (Tech stack: Vertex AI, BigQuery, a simplified user interface (e.g., built on App Engine))",
    "dataflow": [
      "Factory sensor and quality control data is collected and stored in BigQuery",
      "A simple, no-code user interface is created where a factory worker can select a dataset and define a goal, such as \"Predict which parts are likely to have a defect based on these sensor readings.\"",
      "The interface calls the Vertex AI AutoML API, which automatically trains, tests, and deploys a custom machine learning model without the worker writing any code",
      "The deployed model can then be used in real-time on the production line to flag potential issues, directly improving efficiency"
    ],
    "keywords": [
      "30",
      "blueprint",
      "bring",
      "your",
      "employees",
      "speed",
      "automotive",
      "supply",
      "chain",
      "logistics",
      "vertex",
      "bigquery",
      "simplified",
      "user",
      "interface",
      "built",
      "app",
      "engine"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #30: Bring your employees up to speed on AI using Vertex AI, BigQuery, a simplified user interface (e.g., built on App Engine)",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#30 \u00b7 Bring your employees up to speed on AI",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (Vertex AI, BigQuery, a simplified user interface (e.g., built on App Engine))",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "sensors",
          "label": "Factory Sensors & QC",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Sensor & Quality Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "ui",
          "label": "No-code Interface",
          "kind": "service",
          "tech": "App Engine",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "automl",
          "label": "Defect Prediction Model",
          "kind": "ai",
          "tech": "Vertex AI AutoML",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "worker",
          "label": "Factory Worker",
          "kind": "user"
        },
        {
          "id": "line",
          "label": "Production Line",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "sensors",
          "to": "bq",
          "label": "readings"
        },
        {
          "from": "worker",
          "to": "ui",
          "label": "dataset & goal"
        },
        {
          "from": "ui",
          "to": "automl",
          "label": "train, test & deploy"
        },
        {
          "from": "bq",
          "to": "automl",
          "label": "training data"
        },
        {
          "from": "automl",
          "to": "line",
          "label": "real-time defect flags"
        }
      ]
    }
  },
  {
    "id": "genai-bp-31",
    "title": "#31 \u00b7 Build an AI-powered sales assistant for e-commerce",
    "category": "Blueprint #31 \u00b7 Automotive, Supply Chain & Logistics",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Automotive, Supply Chain & Logistics"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a retailer with a sophisticated online storefront. Your challenge is that customers often have nuanced questions or need guidance that a simple search bar or FAQ can't provide, leading to abandoned carts and missed sales opportunities. (Tech stack: Vertex AI, BigQuery, Cloud Run)",
    "dataflow": [
      "Your entire product catalog and customer interaction history are indexed from BigQuery into Vertex AI Agent Builder",
      "When a customer interacts with the chat assistant on your website, their query is sent to a service on Cloud Run",
      "The service uses the Agent Builder to understand the user's intent and retrieve relevant product information",
      "For complex or conversational queries, the retrieved information is passed to Gemini with a prompt like, \"A customer is asking for a durable, family-friendly car. Based on these three models, explain which is the best fit and why.\"",
      "Gemini generates a helpful, conversational response that guides the customer to the right product, increasing conversion"
    ],
    "keywords": [
      "31",
      "blueprint",
      "build",
      "powered",
      "sales",
      "assistant",
      "for",
      "commerce",
      "automotive",
      "supply",
      "chain",
      "logistics",
      "vertex",
      "bigquery",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #31: Build an AI-powered sales assistant for e-commerce using Vertex AI, BigQuery, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#31 \u00b7 Build an AI-powered sales assistant for e-commerce",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Automotive, Supply Chain & Logistics (Vertex AI, BigQuery, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "bq",
          "label": "Catalog & History",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "agent",
          "label": "Shopping Agent",
          "kind": "ai",
          "tech": "Vertex AI Agent Builder",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "customer",
          "label": "Customer",
          "kind": "user"
        },
        {
          "id": "site",
          "label": "Website Chat",
          "kind": "client"
        },
        {
          "id": "run",
          "label": "Chat Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Conversational Answers",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "bq",
          "to": "agent",
          "label": "indexed catalog & history",
          "style": "dashed"
        },
        {
          "from": "customer",
          "to": "site",
          "label": "question"
        },
        {
          "from": "site",
          "to": "run",
          "label": "query"
        },
        {
          "from": "run",
          "to": "agent",
          "label": "intent & products"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "products + question"
        }
      ]
    }
  },
  {
    "id": "genai-bp-32",
    "title": "#32 \u00b7 Automate banking tasks with a financial LLM",
    "category": "Blueprint #32 \u00b7 Financial Services & Insurance",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a neobank or financial institution serving a digitally native customer base. Your challenge is that customers expect intelligent and proactive service that traditional banking workflows can't provide, such as automatically preventing an overdraft. (Tech stack: Vertex AI, Cloud Functions, Pub/Sub, BigQuery)",
    "dataflow": [
      "Real-time transaction data streams into Pub/Sub and is analyzed by a Cloud Function",
      "If a potential overdraft is detected, the function calls a fine-tuned Gemini model (a Financial LLM) with a prompt like, \"This user is about to overdraft. Based on their account history, suggest the best action.\"",
      "Gemini might respond with, \"Move $50 from their 'Savings' account.\"",
      "The system can then either automatically execute the transfer or send a proactive notification to the user, preventing the fee and improving their financial health"
    ],
    "keywords": [
      "32",
      "blueprint",
      "automate",
      "banking",
      "tasks",
      "with",
      "financial",
      "llm",
      "services",
      "insurance",
      "vertex",
      "cloud",
      "functions",
      "pub",
      "sub",
      "bigquery"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #32: Automate banking tasks with a financial LLM using Vertex AI, Cloud Functions, Pub/Sub, BigQuery",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#32 \u00b7 Automate banking tasks with a financial LLM",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (Vertex AI, Cloud Functions, Pub/Sub, BigQuery)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "core",
          "label": "Core Banking",
          "kind": "external"
        },
        {
          "id": "ps",
          "label": "Transactions",
          "kind": "queue",
          "tech": "Pub/Sub",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "fn",
          "label": "Overdraft Detector",
          "kind": "function",
          "tech": "Cloud Run functions",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Account History",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Financial LLM (fine-tuned)",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "transfer",
          "label": "Transfer API",
          "kind": "external"
        },
        {
          "id": "customer",
          "label": "Customer",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "core",
          "to": "ps",
          "label": "real-time transactions"
        },
        {
          "from": "ps",
          "to": "fn",
          "label": "each transaction",
          "style": "dashed"
        },
        {
          "from": "fn",
          "to": "bq",
          "label": "account history"
        },
        {
          "from": "fn",
          "to": "gemini",
          "label": "best action?"
        },
        {
          "from": "fn",
          "to": "transfer",
          "label": "move $50 from savings"
        },
        {
          "from": "fn",
          "to": "customer",
          "label": "proactive notification"
        }
      ]
    }
  },
  {
    "id": "genai-bp-33",
    "title": "#33 \u00b7 Create an AI mortgage agent to personalize quotes",
    "category": "Blueprint #33 \u00b7 Financial Services & Insurance",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a digital mortgage lender in a highly competitive market. Your challenge is that potential borrowers are often comparison shopping and will abandon your site if they can't get a fast, clear, and personalized rate quote without a lengthy application process. (Tech stack: Vertex AI, Cloud Run, a secure document store (e.g., Cloud Storage))",
    "dataflow": [
      "A borrower uses a feature like \"Beat this Rate\" and uploads a competitor's quote sheet to Cloud Storage",
      "The document is sent to a service on Cloud Run, which calls a multimodal Gemini model",
      "Gemini extracts the key terms (rate, points, term length) from the document",
      "The service uses this data to query internal rate tables and constructs a new prompt for Gemini, such as \"Create a comparison table and a friendly chat message showing how our 2.95% rate is better than this competitor's 3.15% rate.\"",
      "The personalized quote and comparison are displayed to the borrower in seconds"
    ],
    "keywords": [
      "33",
      "blueprint",
      "create",
      "mortgage",
      "agent",
      "personalize",
      "quotes",
      "financial",
      "services",
      "insurance",
      "vertex",
      "cloud",
      "run",
      "secure",
      "document",
      "store",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #33: Create an AI mortgage agent to personalize quotes using Vertex AI, Cloud Run, a secure document store (e.g., Cloud Storage)",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#33 \u00b7 Create an AI mortgage agent to personalize quotes",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (Vertex AI, Cloud Run, a secure document store (e.g., Cloud Storage))",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "borrower",
          "label": "Borrower",
          "kind": "user"
        },
        {
          "id": "gcs",
          "label": "Quote Uploads",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "run",
          "label": "Rate Comparison Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Quote Extraction & Messaging",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "rates",
          "label": "Internal Rate Tables",
          "kind": "database"
        }
      ],
      "edges": [
        {
          "from": "borrower",
          "to": "gcs",
          "label": "competitor's quote"
        },
        {
          "from": "gcs",
          "to": "run",
          "label": "document"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "extract terms, write comparison"
        },
        {
          "from": "run",
          "to": "rates",
          "label": "our rates"
        }
      ]
    }
  },
  {
    "id": "genai-bp-34",
    "title": "#34 \u00b7 Build an AI agent to enhance wealth management advisory",
    "category": "Blueprint #34 \u00b7 Financial Services & Insurance",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a wealth management firm where financial advisors spend significant time on administrative tasks like writing call summaries. Your challenge is freeing up advisors from this manual work so they can focus on high-value client relationship building and strategic advice. (Tech stack: Speech-to-Text API, Vertex AI, a CRM system )",
    "dataflow": [
      "During a client call, the audio is transcribed in real-time by the Speech-to-Text API",
      "After the call, the full transcript is sent to a Gemini model with a prompt like, \"Summarize this financial advisory call. Identify key client concerns, action items for the advisor, and update the client's financial goals.\"",
      "Gemini generates a structured summary and a list of action items",
      "This summary is automatically logged into the firm's CRM system, saving the advisor significant time and ensuring a consistent record of every interaction"
    ],
    "keywords": [
      "34",
      "blueprint",
      "build",
      "agent",
      "enhance",
      "wealth",
      "management",
      "advisory",
      "financial",
      "services",
      "insurance",
      "speech",
      "text",
      "api",
      "vertex",
      "crm",
      "system"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #34: Build an AI agent to enhance wealth management advisory using Speech-to-Text API, Vertex AI, a CRM system ",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#34 \u00b7 Build an AI agent to enhance wealth management advisory",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (Speech-to-Text API, Vertex AI, a CRM system )",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "call",
          "label": "Client & Advisor Call",
          "kind": "user"
        },
        {
          "id": "stt",
          "label": "Live Transcription",
          "kind": "ai",
          "tech": "Speech-to-Text",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Call Summary",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "crm",
          "label": "CRM",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "call",
          "to": "stt",
          "label": "call audio"
        },
        {
          "from": "stt",
          "to": "gemini",
          "label": "full transcript"
        },
        {
          "from": "gemini",
          "to": "crm",
          "label": "summary & action items"
        }
      ]
    }
  },
  {
    "id": "genai-bp-35",
    "title": "#35 \u00b7 Accelerate underwriting with AI-powered document analysis",
    "category": "Blueprint #35 \u00b7 Financial Services & Insurance",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a mortgage lender or broker dealing with thousands of loan applications. Your challenge is the slow, manual process of underwriting, where humans must read through complex financial documents, leading to long closing times and high operational costs. (Tech stack: Document AI, Vertex AI, BigQuery, Cloud Run)",
    "dataflow": [
      "A broker uploads a borrower's financial documents (pay stubs, bank statements) to a portal",
      "A service on Cloud Run sends the documents to Document AI to extract and structure all the raw data (income, assets, debts)",
      "The structured data is stored in BigQuery and sent to a Gemini model with a prompt like, \"Analyze this borrower's financial data against our underwriting guidelines and flag any potential risks.\"",
      "The model returns a risk analysis, allowing a human underwriter to make a final decision in minutes instead of hours, dramatically increasing productivity"
    ],
    "keywords": [
      "35",
      "blueprint",
      "accelerate",
      "underwriting",
      "with",
      "powered",
      "document",
      "analysis",
      "financial",
      "services",
      "insurance",
      "vertex",
      "bigquery",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #35: Accelerate underwriting with AI-powered document analysis using Document AI, Vertex AI, BigQuery, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#35 \u00b7 Accelerate underwriting with AI-powered document analysis",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (Document AI, Vertex AI, BigQuery, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "broker",
          "label": "Broker",
          "kind": "user"
        },
        {
          "id": "portal",
          "label": "Upload Portal",
          "kind": "client"
        },
        {
          "id": "run",
          "label": "Underwriting Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "docai",
          "label": "Financial Document Parser",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Borrower Financials",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Risk Analysis",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "underwriter",
          "label": "Underwriter",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "broker",
          "to": "portal",
          "label": "pay stubs & statements"
        },
        {
          "from": "portal",
          "to": "run",
          "label": "documents"
        },
        {
          "from": "run",
          "to": "docai",
          "label": "extract income, assets, debts"
        },
        {
          "from": "run",
          "to": "bq",
          "label": "structured data"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "check against guidelines"
        },
        {
          "from": "run",
          "to": "underwriter",
          "label": "risk analysis"
        }
      ]
    }
  },
  {
    "id": "genai-bp-36",
    "title": "#36 \u00b7 Automate international transfers via a chat interface",
    "category": "Blueprint #36 \u00b7 Financial Services & Insurance",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a financial institution specializing in currency exchange. Initiating international transfers often requires customers to navigate complex online forms or visit a branch during business hours, creating a slow and inconvenient experience. (Tech stack: A chat platform API, Dialogflow CX (or Vertex AI Conversation), Cloud Functions)",
    "dataflow": [
      "A customer starts a conversation and says, \"I want to send $500 to my brother in the UK.\"",
      "The message is sent to a Dialogflow CX agent, which is trained to handle transfer requests",
      "The agent asks clarifying questions (e.g., \"What is the recipient's bank information?\" )",
      "Once all the necessary information is collected, Dialogflow calls a secure Cloud Function",
      "The Cloud Function executes the transfer via the bank's core systems and sends a confirmation message back to the customer through the chat interface, completing the entire transaction 24/7 without human intervention"
    ],
    "keywords": [
      "36",
      "blueprint",
      "automate",
      "international",
      "transfers",
      "via",
      "chat",
      "interface",
      "financial",
      "services",
      "insurance",
      "platform",
      "api",
      "dialogflow",
      "vertex",
      "conversation",
      "cloud",
      "functions"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #36: Automate international transfers via a chat interface using A chat platform API, Dialogflow CX (or Vertex AI Conversation), Cloud Functions",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#36 \u00b7 Automate international transfers via a chat interface",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (A chat platform API, Dialogflow CX (or Vertex AI Conversation), Cloud Functions)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "customer",
          "label": "Customer",
          "kind": "user"
        },
        {
          "id": "chat",
          "label": "Chat Platform",
          "kind": "client"
        },
        {
          "id": "dialogflow",
          "label": "Transfer Agent",
          "kind": "ai",
          "tech": "Dialogflow CX",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "fn",
          "label": "Transfer Executor",
          "kind": "function",
          "tech": "Cloud Run functions",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "core",
          "label": "Core Banking",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "customer",
          "to": "chat",
          "label": "\"Send $500 to the UK\""
        },
        {
          "from": "chat",
          "to": "dialogflow",
          "label": "messages & answers"
        },
        {
          "from": "dialogflow",
          "to": "fn",
          "label": "collected details"
        },
        {
          "from": "fn",
          "to": "core",
          "label": "execute transfer"
        },
        {
          "from": "fn",
          "to": "chat",
          "label": "confirmation",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-37",
    "title": "#37 \u00b7 Build an AI research assistant for financial analysts",
    "category": "Blueprint #37 \u00b7 Financial Services & Insurance",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a financial institution where analysts spend hours, or even days, gathering data and synthesizing information to produce research reports. Your challenge is accelerating this process to deliver more timely insights to clients while maintaining the highest standards of data privacy. (Tech stack: Vertex AI, BigQuery)",
    "dataflow": [
      "A financial analyst uses an internal research tool and gives it a prompt like, \"Draft a research note on the semiconductor industry's Q3 performance, focusing on supply chain trends and key player earnings.\"",
      "The tool queries internal, proprietary datasets in BigQuery and external, approved market data sources using Vertex AI Search",
      "The retrieved data is passed to a Gemini model with a detailed prompt to generate a draft report",
      "The model produces a structured draft with key insights, charts, and summaries, allowing the analyst to refine and finalize the report in minutes instead of days"
    ],
    "keywords": [
      "37",
      "blueprint",
      "build",
      "research",
      "assistant",
      "for",
      "financial",
      "analysts",
      "services",
      "insurance",
      "vertex",
      "bigquery"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #37: Build an AI research assistant for financial analysts using Vertex AI, BigQuery",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#37 \u00b7 Build an AI research assistant for financial analysts",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (Vertex AI, BigQuery)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "analyst",
          "label": "Financial Analyst",
          "kind": "user"
        },
        {
          "id": "tool",
          "label": "Research Tool",
          "kind": "client"
        },
        {
          "id": "bq",
          "label": "Proprietary Datasets",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "search",
          "label": "Market Data Search",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "market",
          "label": "Approved Market Data",
          "kind": "external"
        },
        {
          "id": "gemini",
          "label": "Report Drafting",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "analyst",
          "to": "tool",
          "label": "research prompt"
        },
        {
          "from": "tool",
          "to": "bq",
          "label": "query"
        },
        {
          "from": "tool",
          "to": "search",
          "label": "market data"
        },
        {
          "from": "market",
          "to": "search",
          "label": "indexed sources",
          "style": "dashed"
        },
        {
          "from": "tool",
          "to": "gemini",
          "label": "retrieved data \u2192 draft note"
        }
      ]
    }
  },
  {
    "id": "genai-bp-38",
    "title": "#38 \u00b7 Automate insurance claims processing with multimodal AI",
    "category": "Blueprint #38 \u00b7 Financial Services & Insurance",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an insurance provider, and your claims process relies on adjustors manually reviewing various documents (photos, repair estimates, police reports). This is slow, error-prone, and leads to a poor customer experience during a stressful time. (Tech stack: Document AI, Vertex AI, Cloud Run)",
    "dataflow": [
      "A claimant uploads all their documents and photos for a claim",
      "A service on Cloud Run sends text documents to Document AI and images to Vertex AI Vision to extract and structure all relevant information",
      "This structured data is then passed to a Gemini model with a prompt like, \"Based on this police report, repair estimate, and photos of the damage, is this auto claim valid under policy #12345? Calculate the estimated payout.\"",
      "The model returns a validation decision and payout amount, allowing simple claims to be settled in near real-time"
    ],
    "keywords": [
      "38",
      "blueprint",
      "automate",
      "insurance",
      "claims",
      "processing",
      "with",
      "multimodal",
      "financial",
      "services",
      "document",
      "vertex",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #38: Automate insurance claims processing with multimodal AI using Document AI, Vertex AI, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#38 \u00b7 Automate insurance claims processing with multimodal AI",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (Document AI, Vertex AI, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "claimant",
          "label": "Claimant",
          "kind": "user"
        },
        {
          "id": "run",
          "label": "Claims Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "docai",
          "label": "Claim Documents",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vision",
          "label": "Damage Photos",
          "kind": "ai",
          "tech": "Vertex AI Vision",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Validation & Payout",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "claimant",
          "to": "run",
          "label": "documents & photos"
        },
        {
          "from": "run",
          "to": "docai",
          "label": "text documents"
        },
        {
          "from": "run",
          "to": "vision",
          "label": "images"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "structured claim \u2192 decision & payout"
        }
      ]
    }
  },
  {
    "id": "genai-bp-39",
    "title": "#39 \u00b7 Build an AI agent to extract data from legal documents",
    "category": "Blueprint #39 \u00b7 Financial Services & Insurance",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a financial advisory or wealth management firm. Your challenge is the time-consuming and highly manual process of reading through lengthy, complex legal documents like wills and trusts to extract key information for estate planning. (Tech stack: Document AI, Vertex AI)",
    "dataflow": [
      "A financial advisor uploads a client's lengthy trust document (a PDF)",
      "The document is processed by Document AI to extract all the raw text while preserving its structure",
      "The extracted text is then sent to a fine-tuned Gemini model with a prompt like, \"From this trust document, extract the beneficiaries, trustees, asset distribution rules, and any specific conditions for inheritance.\"",
      "The model returns the key information in a structured format (like JSON), which can be used to automatically populate the client's profile in the planning platform, saving the advisor hours of manual reading"
    ],
    "keywords": [
      "39",
      "blueprint",
      "build",
      "agent",
      "extract",
      "data",
      "from",
      "legal",
      "documents",
      "financial",
      "services",
      "insurance",
      "document",
      "vertex"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #39: Build an AI agent to extract data from legal documents using Document AI, Vertex AI",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#39 \u00b7 Build an AI agent to extract data from legal documents",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (Document AI, Vertex AI)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "advisor",
          "label": "Financial Advisor",
          "kind": "user"
        },
        {
          "id": "docai",
          "label": "Trust Document Parser",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Clause Extraction (fine-tuned)",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "platform",
          "label": "Planning Platform",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "advisor",
          "to": "docai",
          "label": "trust PDF"
        },
        {
          "from": "docai",
          "to": "gemini",
          "label": "structured text"
        },
        {
          "from": "gemini",
          "to": "platform",
          "label": "beneficiaries, trustees, rules (JSON)"
        }
      ]
    }
  },
  {
    "id": "genai-bp-40",
    "title": "#40 \u00b7 Automate software bug ticket-to-code generation",
    "category": "Blueprint #40 \u00b7 Financial Services & Insurance",
    "agentCategory": "code",
    "icon": "code",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a software company in a regulated industry, and your developers spend significant time translating bug reports or feature requests from project management tickets into actual code, slowing down the development cycle. (Tech stack: Vertex AI, a project management tool API (e.g., Jira))",
    "dataflow": [
      "When a new bug ticket is created in Jira, a webhook triggers a service",
      "The service retrieves the ticket's description, which details the bug (e.g., \"The 'export' button is not working on the user dashboard for accounts in 'pending' status.\" )",
      "This description is used to construct a detailed prompt for Gemini Code Assist, which has been trained on the company's private codebase",
      "The prompt is, \"Given our codebase, write the Python code to fix the bug described in this ticket.\"",
      "The model generates a code snippet or a pull request with the suggested fix, which a developer can then review, test, and merge, significantly speeding up the process"
    ],
    "keywords": [
      "40",
      "blueprint",
      "automate",
      "software",
      "bug",
      "ticket",
      "code",
      "generation",
      "financial",
      "services",
      "insurance",
      "vertex",
      "project",
      "management",
      "tool",
      "api",
      "jira"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #40: Automate software bug ticket-to-code generation using Vertex AI, a project management tool API (e.g., Jira)",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#40 \u00b7 Automate software bug ticket-to-code generation",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (Vertex AI, a project management tool API (e.g., Jira))",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "jira",
          "label": "Jira",
          "kind": "external"
        },
        {
          "id": "svc",
          "label": "Ticket-to-Fix Service",
          "kind": "service",
          "group": "gcp"
        },
        {
          "id": "codeassist",
          "label": "Code Fix Generator",
          "kind": "ai",
          "tech": "Gemini Code Assist",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "repo",
          "label": "Private Codebase",
          "kind": "external"
        },
        {
          "id": "dev",
          "label": "Developer",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "jira",
          "to": "svc",
          "label": "new bug webhook",
          "style": "dashed"
        },
        {
          "from": "svc",
          "to": "codeassist",
          "label": "bug description prompt"
        },
        {
          "from": "repo",
          "to": "codeassist",
          "label": "codebase context",
          "style": "dashed"
        },
        {
          "from": "codeassist",
          "to": "dev",
          "label": "pull request to review"
        }
      ]
    }
  },
  {
    "id": "genai-bp-41",
    "title": "#41 \u00b7 Build an anti-fraud and credit analysis engine",
    "category": "Blueprint #41 \u00b7 Financial Services & Insurance",
    "agentCategory": "security",
    "icon": "security",
    "industries": [
      "Financial Services & Insurance"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a fintech company providing payment solutions or loans. Your challenge is accurately assessing credit risk and detecting fraudulent transactions in real-time to protect both your business and your customers, without slowing down the user experience. (Tech stack: BigQuery, Vertex AI, Dataflow)",
    "dataflow": [
      "Real-time transaction and user behavior data streams through Dataflow and is stored in BigQuery",
      "Vertex AI machine learning models are continuously trained on this historical data to learn the patterns of both legitimate and fraudulent activity",
      "When a new transaction occurs, the data is sent to the deployed fraud detection model in real-time",
      "The model returns a risk score in milliseconds",
      "If the score is high, the transaction can be automatically blocked or flagged for manual review, preventing fraud before it happens"
    ],
    "keywords": [
      "41",
      "blueprint",
      "build",
      "anti",
      "fraud",
      "and",
      "credit",
      "analysis",
      "engine",
      "financial",
      "services",
      "insurance",
      "bigquery",
      "vertex",
      "dataflow"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #41: Build an anti-fraud and credit analysis engine using BigQuery, Vertex AI, Dataflow",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#41 \u00b7 Build an anti-fraud and credit analysis engine",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Financial Services & Insurance (BigQuery, Vertex AI, Dataflow)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "events",
          "label": "Transactions & Behavior",
          "kind": "external"
        },
        {
          "id": "df",
          "label": "Event Streaming",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Transaction History",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Fraud Detection Model",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "payments",
          "label": "New Transactions",
          "kind": "external"
        },
        {
          "id": "review",
          "label": "Fraud Review",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "events",
          "to": "df",
          "label": "real-time events"
        },
        {
          "from": "df",
          "to": "bq",
          "label": "stored"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "continuous training"
        },
        {
          "from": "payments",
          "to": "vertex",
          "label": "score in milliseconds"
        },
        {
          "from": "vertex",
          "to": "review",
          "label": "block or flag"
        }
      ]
    }
  },
  {
    "id": "genai-bp-42",
    "title": "#42 \u00b7 Enable personalized and continuous patient monitoring",
    "category": "Blueprint #42 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a healthcare provider managing a large population of patients with chronic conditions like diabetes. Your challenge is that periodic check-ins don't provide a complete picture of a patient's health, making it difficult to offer timely, personalized advice or intervene before complications arise. (Tech stack: IoT devices (or mobile app), Pub/Sub, Dataflow, BigQuery, Vertex AI)",
    "dataflow": [
      "Real-time patient data from sources like glucose monitors is streamed to Pub/Sub",
      "A Dataflow pipeline processes and normalizes the data, storing it in BigQuery against the patient's record",
      "The system uses a Vertex AI model to analyze trends, and if an anomaly is detected (e.g., consistently high blood sugar), it triggers an alert",
      "Gemini then generates a personalized message for the patient, like \"We've noticed your glucose levels have been high in the evenings. Try a short walk after dinner and let's see how your numbers look tomorrow.\""
    ],
    "keywords": [
      "42",
      "blueprint",
      "enable",
      "personalized",
      "and",
      "continuous",
      "patient",
      "monitoring",
      "healthcare",
      "life",
      "sciences",
      "iot",
      "devices",
      "mobile",
      "app",
      "pub",
      "sub",
      "dataflow",
      "bigquery"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #42: Enable personalized and continuous patient monitoring using IoT devices (or mobile app), Pub/Sub, Dataflow, BigQuery, Vertex AI",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#42 \u00b7 Enable personalized and continuous patient monitoring",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (IoT devices (or mobile app), Pub/Sub, Dataflow, BigQuery, Vertex AI)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "patient",
          "label": "Patient",
          "kind": "user"
        },
        {
          "id": "device",
          "label": "Glucose Monitor / App",
          "kind": "mobile",
          "tech": "IoT devices"
        },
        {
          "id": "ps",
          "label": "Patient Telemetry",
          "kind": "queue",
          "tech": "Pub/Sub",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "df",
          "label": "Normalization",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Patient Records",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Trend & Anomaly Model",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Personalized Message",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "patient",
          "to": "device",
          "label": "readings"
        },
        {
          "from": "device",
          "to": "ps",
          "label": "real-time data"
        },
        {
          "from": "ps",
          "to": "df",
          "label": "events"
        },
        {
          "from": "df",
          "to": "bq",
          "label": "per patient"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "trends"
        },
        {
          "from": "vertex",
          "to": "gemini",
          "label": "anomaly alert \u2192 coaching message"
        }
      ]
    }
  },
  {
    "id": "genai-bp-43",
    "title": "#43 \u00b7 Build an AI assistant for radiology workflows",
    "category": "Blueprint #43 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a healthcare provider, and your radiologists are facing immense pressure from increasing workloads. Your challenge is helping them analyze complex images, search for relevant prior studies, and create regulatory-compliant reports more efficiently and accurately. (Tech stack: Vertex AI, Google Cloud Healthcare API, PACS system)",
    "dataflow": [
      "A new radiology image is ingested and de-identified via the Healthcare API and stored in a PACS",
      "The image is sent to a Vertex AI vision model to detect and highlight potential areas of interest",
      "A radiologist can use Vertex AI Search, which is indexed on millions of prior anonymized studies, to find similar cases",
      "After review, the radiologist dictates their findings, and Gemini helps draft a structured, compliant report, which is then finalized and logged, freeing up the radiologist to focus on complex diagnostic work"
    ],
    "keywords": [
      "43",
      "blueprint",
      "build",
      "assistant",
      "for",
      "radiology",
      "workflows",
      "healthcare",
      "life",
      "sciences",
      "vertex",
      "google",
      "cloud",
      "api",
      "pacs",
      "system"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #43: Build an AI assistant for radiology workflows using Vertex AI, Google Cloud Healthcare API, PACS system",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#43 \u00b7 Build an AI assistant for radiology workflows",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (Vertex AI, Google Cloud Healthcare API, PACS system)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "modality",
          "label": "Imaging Modality",
          "kind": "external"
        },
        {
          "id": "hapi",
          "label": "De-identification",
          "kind": "api",
          "tech": "Cloud Healthcare API",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "pacs",
          "label": "PACS",
          "kind": "external"
        },
        {
          "id": "vision",
          "label": "Area-of-Interest Detection",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "search",
          "label": "Similar Case Search",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Report Drafting",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "radiologist",
          "label": "Radiologist",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "modality",
          "to": "hapi",
          "label": "new image"
        },
        {
          "from": "hapi",
          "to": "pacs",
          "label": "de-identified study"
        },
        {
          "from": "pacs",
          "to": "vision",
          "label": "image"
        },
        {
          "from": "vision",
          "to": "radiologist",
          "label": "highlighted areas"
        },
        {
          "from": "radiologist",
          "to": "search",
          "label": "similar prior cases"
        },
        {
          "from": "radiologist",
          "to": "gemini",
          "label": "dictated findings \u2192 structured report"
        }
      ]
    }
  },
  {
    "id": "genai-bp-44",
    "title": "#44 \u00b7 Create a virtual assistant for caregiver shift handoffs",
    "category": "Blueprint #44 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a large healthcare network, and a critical point of failure is the shift change between nurses or caregivers. Your challenge is ensuring that crucial context and patient status details are not lost during this handoff, which can impact the continuity and quality of care. (Tech stack: Speech-to-Text API, Vertex AI, an Electronic Health Record (EHR) system)",
    "dataflow": [
      "As a nurse ends their shift, they speak into a device and summarize their patient's status",
      "Speech-to-Text transcribes their summary in real-time",
      "The transcript is sent to Gemini with a prompt like, \"Convert this unstructured shift summary into a structured report with sections for 'Vitals', 'Medication Administered', 'Patient Observations', and 'Action Items for Next Shift'.\"",
      "The structured summary is automatically placed in the patient's EHR, allowing the incoming caregiver to get a complete and consistent overview in seconds. For a more detailed example, check out this blog"
    ],
    "keywords": [
      "44",
      "blueprint",
      "create",
      "virtual",
      "assistant",
      "for",
      "caregiver",
      "shift",
      "handoffs",
      "healthcare",
      "life",
      "sciences",
      "speech",
      "text",
      "api",
      "vertex",
      "electronic",
      "health",
      "record"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #44: Create a virtual assistant for caregiver shift handoffs using Speech-to-Text API, Vertex AI, an Electronic Health Record (EHR) system",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#44 \u00b7 Create a virtual assistant for caregiver shift handoffs",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (Speech-to-Text API, Vertex AI, an Electronic Health Record (EHR) system)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "nurse",
          "label": "Outgoing Nurse",
          "kind": "user"
        },
        {
          "id": "stt",
          "label": "Shift Summary Transcription",
          "kind": "ai",
          "tech": "Speech-to-Text",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Structured Handoff",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "ehr",
          "label": "EHR",
          "kind": "external"
        },
        {
          "id": "next",
          "label": "Incoming Caregiver",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "nurse",
          "to": "stt",
          "label": "spoken summary"
        },
        {
          "from": "stt",
          "to": "gemini",
          "label": "transcript"
        },
        {
          "from": "gemini",
          "to": "ehr",
          "label": "vitals, medication, actions"
        },
        {
          "from": "ehr",
          "to": "next",
          "label": "complete overview"
        }
      ]
    }
  },
  {
    "id": "genai-bp-45",
    "title": "#45 \u00b7 Accelerate drug discovery with generative protein design",
    "category": "Blueprint #45 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a biotech or pharmaceutical company, and the traditional process of drug discovery is incredibly slow and expensive. Your challenge is finding a way to rapidly design and test novel proteins that could become the basis for new medicines. (Tech stack: Vertex AI, Google Cloud TPUs)",
    "dataflow": [
      "Scientists input the desired properties of a protein (e.g., \"Design a protein that binds to target X to inhibit its function\" )",
      "This request is sent to a generative AI model running on high-performance TPUs on Google Cloud",
      "The model, trained on vast biological datasets, generates sequences for thousands of novel proteins that meet the specified criteria",
      "These AI-designed proteins can then be synthesized and tested in the lab, drastically shortening the initial R&D phase from years to weeks"
    ],
    "keywords": [
      "45",
      "blueprint",
      "accelerate",
      "drug",
      "discovery",
      "with",
      "generative",
      "protein",
      "design",
      "healthcare",
      "life",
      "sciences",
      "vertex",
      "google",
      "cloud",
      "tpus"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #45: Accelerate drug discovery with generative protein design using Vertex AI, Google Cloud TPUs",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#45 \u00b7 Accelerate drug discovery with generative protein design",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (Vertex AI, Google Cloud TPUs)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "scientists",
          "label": "Scientists",
          "kind": "user"
        },
        {
          "id": "vertex",
          "label": "Protein Design Model",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "tpu",
          "label": "TPU Accelerators",
          "kind": "server",
          "tech": "Cloud TPU",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "lab",
          "label": "Lab Synthesis & Testing",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "scientists",
          "to": "vertex",
          "label": "desired properties"
        },
        {
          "from": "vertex",
          "to": "tpu",
          "label": "runs on"
        },
        {
          "from": "vertex",
          "to": "lab",
          "label": "novel protein sequences"
        }
      ]
    }
  },
  {
    "id": "genai-bp-46",
    "title": "#46 \u00b7 Automate pharmaceutical documentation and formatting",
    "category": "Blueprint #46 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a pharmaceutical company that deals with a high volume of complex documents, from lab results to FDA compliance paperwork. Your challenge is the time-consuming, manual process of transcribing, formatting, and summarizing this information, which slows down operations. (Tech stack: Gemini for Google Workspace, Document AI)",
    "dataflow": [
      "A lab result arrives as a PDF attachment in an employee's inbox",
      "The employee uses Gemini in Gmail with a prompt like, \"Extract the key values from this attached lab result and format them into the standard table in this Google Doc template.\"",
      "Gemini leverages Document AI capabilities to parse the PDF, extract the structured data, and populate the Google Doc",
      "This reduces a multi-step manual process into a single command, saving hours per week"
    ],
    "keywords": [
      "46",
      "blueprint",
      "automate",
      "pharmaceutical",
      "documentation",
      "and",
      "formatting",
      "healthcare",
      "life",
      "sciences",
      "gemini",
      "for",
      "google",
      "workspace",
      "document"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #46: Automate pharmaceutical documentation and formatting using Gemini for Google Workspace, Document AI",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#46 \u00b7 Automate pharmaceutical documentation and formatting",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (Gemini for Google Workspace, Document AI)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        },
        {
          "id": "ws",
          "label": "Google Workspace",
          "kind": "boundary"
        }
      ],
      "nodes": [
        {
          "id": "lab",
          "label": "Lab",
          "kind": "external"
        },
        {
          "id": "inbox",
          "label": "Lab Result Email",
          "kind": "email",
          "tech": "Gmail",
          "group": "ws"
        },
        {
          "id": "gemini",
          "label": "Gemini in Gmail",
          "kind": "ai",
          "tech": "Gemini for Google Workspace",
          "provider": "gcp",
          "group": "ws"
        },
        {
          "id": "docai",
          "label": "PDF Parsing",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "doc",
          "label": "Report Template",
          "kind": "client",
          "tech": "Google Docs",
          "group": "ws"
        },
        {
          "id": "employee",
          "label": "Employee",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "lab",
          "to": "inbox",
          "label": "PDF lab result"
        },
        {
          "from": "employee",
          "to": "gemini",
          "label": "extract & format prompt"
        },
        {
          "from": "inbox",
          "to": "gemini",
          "label": "attachment"
        },
        {
          "from": "gemini",
          "to": "docai",
          "label": "parse PDF"
        },
        {
          "from": "gemini",
          "to": "doc",
          "label": "populated table"
        }
      ]
    }
  },
  {
    "id": "genai-bp-47",
    "title": "#47 \u00b7 Build an AI-enhanced underwriting model for insurers",
    "category": "Blueprint #47 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a commercial insurer, and quoting policies for complex risks requires underwriters to manually assess vast amounts of data, a process that can take days. Your challenge is to automate and accelerate this process to provide faster quotes and gain a competitive edge. (Tech stack: BigQuery, Vertex AI, Cloud Run)",
    "dataflow": [
      "Historical data on leads, quotes, and claims outcomes is stored and processed in BigQuery",
      "This data is used to train a Vertex AI machine learning model to predict the risk associated with a new lead",
      "When a new request for a quote arrives, the data is sent to a service on Cloud Run",
      "The service calls the deployed Vertex AI model, which returns a risk score and a suggested premium in seconds",
      "This automates the initial assessment, allowing a human underwriter to review the AI-generated quote and make a final decision in minutes instead of days"
    ],
    "keywords": [
      "47",
      "blueprint",
      "build",
      "enhanced",
      "underwriting",
      "model",
      "for",
      "insurers",
      "healthcare",
      "life",
      "sciences",
      "bigquery",
      "vertex",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #47: Build an AI-enhanced underwriting model for insurers using BigQuery, Vertex AI, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#47 \u00b7 Build an AI-enhanced underwriting model for insurers",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (BigQuery, Vertex AI, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "bq",
          "label": "Leads, Quotes & Claims",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Risk Model",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "requests",
          "label": "Quote Requests",
          "kind": "external"
        },
        {
          "id": "run",
          "label": "Quote Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "underwriter",
          "label": "Underwriter",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "bq",
          "to": "vertex",
          "label": "training data"
        },
        {
          "from": "requests",
          "to": "run",
          "label": "new lead"
        },
        {
          "from": "run",
          "to": "vertex",
          "label": "predict risk"
        },
        {
          "from": "run",
          "to": "underwriter",
          "label": "risk score & premium"
        }
      ]
    }
  },
  {
    "id": "genai-bp-48",
    "title": "#48 \u00b7 Build an intelligent search platform for clinical research",
    "category": "Blueprint #48 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a large research hospital or institution with petabytes of valuable clinical data. Your challenge is that this data is often siloed and difficult for researchers to access and analyze, creating a major roadblock to scientific discovery. (Tech stack: Vertex AI Search, BigQuery, Google Cloud Healthcare API)",
    "dataflow": [
      "Petabytes of clinical data are de-identified using the Healthcare API and consolidated into BigQuery",
      "The entire dataset, including unstructured notes and structured data, is indexed into Vertex AI Search",
      "A researcher can now use a simple, natural language search bar to ask complex questions like, \"Find all patient cohorts over the age of 50 with a history of heart disease who responded positively to drug X.\"",
      "Vertex AI Search retrieves the relevant, anonymized records from across the entire 50-petabyte dataset, accelerating research from months to minutes"
    ],
    "keywords": [
      "48",
      "blueprint",
      "build",
      "intelligent",
      "search",
      "platform",
      "for",
      "clinical",
      "research",
      "healthcare",
      "life",
      "sciences",
      "vertex",
      "bigquery",
      "google",
      "cloud",
      "api"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #48: Build an intelligent search platform for clinical research using Vertex AI Search, BigQuery, Google Cloud Healthcare API",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#48 \u00b7 Build an intelligent search platform for clinical research",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (Vertex AI Search, BigQuery, Google Cloud Healthcare API)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "clinical",
          "label": "Clinical Systems",
          "kind": "external"
        },
        {
          "id": "hapi",
          "label": "De-identification",
          "kind": "api",
          "tech": "Cloud Healthcare API",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Clinical Data Warehouse",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "search",
          "label": "Cohort Search",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "researcher",
          "label": "Researcher",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "clinical",
          "to": "hapi",
          "label": "clinical data"
        },
        {
          "from": "hapi",
          "to": "bq",
          "label": "de-identified records"
        },
        {
          "from": "bq",
          "to": "search",
          "label": "index notes & data",
          "style": "dashed"
        },
        {
          "from": "researcher",
          "to": "search",
          "label": "natural-language question"
        }
      ]
    }
  },
  {
    "id": "genai-bp-49",
    "title": "#49 \u00b7 Predict disease outbreaks with public and private data",
    "category": "Blueprint #49 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a pharmaceutical company or public health organization. Your challenge is to move from reacting to seasonal outbreaks like the flu to proactively predicting them, allowing for better resource planning, vaccine distribution, and public health messaging. (Tech stack: BigQuery, Vertex AI, Google Trends API)",
    "dataflow": [
      "Anonymized, aggregated Google Search trend data (via the Trends API ) for terms like \"fever\" and \"cough\" is combined with internal historical sales data for flu medication in BigQuery",
      "A Gemini model is used to analyze these combined datasets to identify correlations and predict future outbreaks on a location-specific basis",
      "The system generates a forecast, such as \"A 20% increase in search traffic for 'flu symptoms' in Ohio predicts a spike in cases in 7-10 days.\", which is then visualized on a dashboard for real-time healthcare planning"
    ],
    "keywords": [
      "49",
      "blueprint",
      "predict",
      "disease",
      "outbreaks",
      "with",
      "public",
      "and",
      "private",
      "data",
      "healthcare",
      "life",
      "sciences",
      "bigquery",
      "vertex",
      "google",
      "trends",
      "api"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #49: Predict disease outbreaks with public and private data using BigQuery, Vertex AI, Google Trends API",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#49 \u00b7 Predict disease outbreaks with public and private data",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (BigQuery, Vertex AI, Google Trends API)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "trends",
          "label": "Search Trends",
          "kind": "api",
          "tech": "Google Trends API"
        },
        {
          "id": "sales",
          "label": "Internal Sales History",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Combined Datasets",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Outbreak Prediction",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "dash",
          "label": "Planning Dashboard",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "trends",
          "to": "bq",
          "label": "symptom searches"
        },
        {
          "from": "sales",
          "to": "bq",
          "label": "medication sales"
        },
        {
          "from": "bq",
          "to": "gemini",
          "label": "combined data"
        },
        {
          "from": "gemini",
          "to": "dash",
          "label": "location forecasts"
        }
      ]
    }
  },
  {
    "id": "genai-bp-50",
    "title": "#50 \u00b7 Enhance IVF outcomes with AI-powered embryo analysis",
    "category": "Blueprint #50 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a fertility clinic, and one of the most critical and difficult parts of the IVF process is selecting the embryo with the highest chance of a successful pregnancy. Your challenge is improving the accuracy of this selection process to give patients the best possible outcomes. (Tech stack: Vertex AI, Google Cloud Storage)",
    "dataflow": [
      "High-resolution images of embryos are uploaded to Google Cloud Storage",
      "A Vertex AI Vision model analyzes the images, extracting hundreds of morphological features that are imperceptible to the human eye",
      "This feature data, along with the eventual outcome data (successful implantation or not), is used to train an AutoML model",
      "When analyzing a new patient's embryos, the model provides a viability score for each one, helping embryologists make a more data-driven decision and increasing the likelihood of a successful IVF cycle"
    ],
    "keywords": [
      "50",
      "blueprint",
      "enhance",
      "ivf",
      "outcomes",
      "with",
      "powered",
      "embryo",
      "analysis",
      "healthcare",
      "life",
      "sciences",
      "vertex",
      "google",
      "cloud",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #50: Enhance IVF outcomes with AI-powered embryo analysis using Vertex AI, Google Cloud Storage",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#50 \u00b7 Enhance IVF outcomes with AI-powered embryo analysis",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (Vertex AI, Google Cloud Storage)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "embryologists",
          "label": "Embryologists",
          "kind": "user"
        },
        {
          "id": "gcs",
          "label": "Embryo Images",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vision",
          "label": "Morphology Features",
          "kind": "ai",
          "tech": "Vertex AI Vision",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "automl",
          "label": "Viability Model",
          "kind": "ai",
          "tech": "Vertex AI AutoML",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "outcomes",
          "label": "Implantation Outcomes",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "embryologists",
          "to": "gcs",
          "label": "high-resolution images"
        },
        {
          "from": "gcs",
          "to": "vision",
          "label": "images"
        },
        {
          "from": "vision",
          "to": "automl",
          "label": "features \u2192 viability score"
        },
        {
          "from": "outcomes",
          "to": "automl",
          "label": "training labels",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-51",
    "title": "#51 \u00b7 Automate routing and medical order processing for home health",
    "category": "Blueprint #51 \u00b7 Healthcare & Life Sciences",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Healthcare & Life Sciences"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a home health company managing a fleet of nurses who conduct thousands of patient visits. Your challenge is optimizing their daily routes to be as efficient as possible while also speeding up the manual, paper-based process of handling medical orders. (Tech stack: Google Maps Platform (Routes API), Document AI, Cloud Run)",
    "dataflow": [
      "A patient's medical order (PDF or image) is uploaded to the system",
      "A service on Cloud Run sends the file to Document AI, which automatically extracts the patient details, required services, and location",
      "Each day, the system sends the list of all required visits to the Google Maps Routes API, which calculates the most efficient multi-stop route for each nurse",
      "The optimized route is sent to the nurse's mobile app, saving time and fuel, while the automated order processing reduces administrative overhead"
    ],
    "keywords": [
      "51",
      "blueprint",
      "automate",
      "routing",
      "and",
      "medical",
      "order",
      "processing",
      "for",
      "home",
      "health",
      "healthcare",
      "life",
      "sciences",
      "google",
      "maps",
      "platform",
      "routes",
      "api"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #51: Automate routing and medical order processing for home health using Google Maps Platform (Routes API), Document AI, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#51 \u00b7 Automate routing and medical order processing for home health",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Healthcare & Life Sciences (Google Maps Platform (Routes API), Document AI, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "orders",
          "label": "Medical Orders",
          "kind": "external"
        },
        {
          "id": "run",
          "label": "Order Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "docai",
          "label": "Order Extraction",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "maps",
          "label": "Route Optimization",
          "kind": "api",
          "tech": "Google Maps Platform (Routes API)",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "nurse",
          "label": "Nurse App",
          "kind": "mobile"
        }
      ],
      "edges": [
        {
          "from": "orders",
          "to": "run",
          "label": "PDF or image"
        },
        {
          "from": "run",
          "to": "docai",
          "label": "patient, services, location"
        },
        {
          "from": "run",
          "to": "maps",
          "label": "daily visit list"
        },
        {
          "from": "run",
          "to": "nurse",
          "label": "optimized route"
        }
      ]
    }
  },
  {
    "id": "genai-bp-52",
    "title": "#52 \u00b7 Build a customizable AI contact center solution",
    "category": "Blueprint #52 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a telecommunications provider serving business customers who need to modernize their own customer service. Your challenge is providing a flexible, AI-powered contact center solution that can both handle calls automatically and assist human agents in real-time. (Tech stack: Contact Center AI Platform (CCAI), Vertex AI, a CRM system)",
    "dataflow": [
      "When a customer calls, they are first greeted by an AI-powered agent built on Contact Center AI",
      "The agent handles common requests, such as checking an account balance",
      "If the caller needs to speak to a human, the call is transferred",
      "As the human agent speaks, the \"Agent Assist\" feature listens to the conversation, transcribes it in real-time, and uses Gemini to provide the agent with relevant knowledge base articles and next-step suggestions directly in their CRM interface"
    ],
    "keywords": [
      "52",
      "blueprint",
      "build",
      "customizable",
      "contact",
      "center",
      "solution",
      "telecommunications",
      "tech",
      "secops",
      "platform",
      "ccai",
      "vertex",
      "crm",
      "system"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #52: Build a customizable AI contact center solution using Contact Center AI Platform (CCAI), Vertex AI, a CRM system",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#52 \u00b7 Build a customizable AI contact center solution",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (Contact Center AI Platform (CCAI), Vertex AI, a CRM system)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "caller",
          "label": "Caller",
          "kind": "user"
        },
        {
          "id": "ccai",
          "label": "Virtual Agent",
          "kind": "ai",
          "tech": "Contact Center AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "human",
          "label": "Human Agent",
          "kind": "user"
        },
        {
          "id": "assist",
          "label": "Agent Assist",
          "kind": "ai",
          "tech": "Agent Assist",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Knowledge & Next Steps",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "crm",
          "label": "CRM",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "caller",
          "to": "ccai",
          "label": "call"
        },
        {
          "from": "ccai",
          "to": "human",
          "label": "transfer"
        },
        {
          "from": "human",
          "to": "assist",
          "label": "live conversation",
          "style": "dashed"
        },
        {
          "from": "assist",
          "to": "gemini",
          "label": "real-time transcript"
        },
        {
          "from": "assist",
          "to": "crm",
          "label": "articles & next steps"
        }
      ]
    }
  },
  {
    "id": "genai-bp-53",
    "title": "#53 \u00b7 Empower your workforce with generative AI tools",
    "category": "Blueprint #53 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a large telecommunications company, and you want to empower your entire workforce with AI. Your challenge is providing easy access to generative AI tools while maintaining strict security, privacy, and compliance controls over your sensitive company data. (Tech stack: Vertex AI, Identity and Access Management (IAM), Google Cloud Storage)",
    "dataflow": [
      "An internal \"AI Sandbox\" platform is built using Vertex AI Agent Builder",
      "The platform is grounded on a curated set of internal company documents (legal, HR, technical docs) stored securely in Google Cloud Storage",
      "Employees access the sandbox through their corporate identity, with IAM rules ensuring they can only access data they are permissioned to see",
      "An employee can then ask questions like \"Summarize our new data privacy policy\" and receive an answer from Gemini that is based solely on the trusted internal documents, democratizing information securely"
    ],
    "keywords": [
      "53",
      "blueprint",
      "empower",
      "your",
      "workforce",
      "with",
      "generative",
      "tools",
      "telecommunications",
      "tech",
      "secops",
      "vertex",
      "identity",
      "and",
      "access",
      "management",
      "iam",
      "google",
      "cloud"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #53: Empower your workforce with generative AI tools using Vertex AI, Identity and Access Management (IAM), Google Cloud Storage",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#53 \u00b7 Empower your workforce with generative AI tools",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (Vertex AI, Identity and Access Management (IAM), Google Cloud Storage)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "employees",
          "label": "Employees",
          "kind": "user"
        },
        {
          "id": "iam",
          "label": "Access Control",
          "kind": "security",
          "tech": "Identity and Access Management",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "agent",
          "label": "AI Sandbox",
          "kind": "ai",
          "tech": "Vertex AI Agent Builder",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gcs",
          "label": "Curated Internal Docs",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Grounded Answers",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "employees",
          "to": "iam",
          "label": "corporate identity"
        },
        {
          "from": "iam",
          "to": "agent",
          "label": "permitted access"
        },
        {
          "from": "iam",
          "to": "gcs",
          "label": "document permissions",
          "style": "dashed"
        },
        {
          "from": "agent",
          "to": "gcs",
          "label": "grounding documents"
        },
        {
          "from": "agent",
          "to": "gemini",
          "label": "grounded prompt"
        }
      ]
    }
  },
  {
    "id": "genai-bp-54",
    "title": "#54 \u00b7 Automate call summarization and quality assurance",
    "category": "Blueprint #54 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a telecom operator with a large customer service center. Your challenge is ensuring consistent quality and identifying best practices from thousands of daily calls, a task that requires managers to manually listen to a small, random sample of call recordings. (Tech stack: Speech-to-Text API, Vertex AI, BigQuery, Looker)",
    "dataflow": [
      "Audio from all customer service calls is transcribed by the Speech-to-Text API, and the text is stored in BigQuery",
      "A scheduled job sends the transcripts to Gemini with a prompt like, \"Summarize this call, classify the customer's reason for calling, and rate the agent's effectiveness based on our quality rubric.\"",
      "The structured analysis is written back to BigQuery",
      "Managers use a Looker dashboard to see trends, identify top-performing agents, and find calls that can be used as examples for team training"
    ],
    "keywords": [
      "54",
      "blueprint",
      "automate",
      "call",
      "summarization",
      "and",
      "quality",
      "assurance",
      "telecommunications",
      "tech",
      "secops",
      "speech",
      "text",
      "api",
      "vertex",
      "bigquery",
      "looker"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #54: Automate call summarization and quality assurance using Speech-to-Text API, Vertex AI, BigQuery, Looker",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#54 \u00b7 Automate call summarization and quality assurance",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (Speech-to-Text API, Vertex AI, BigQuery, Looker)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "calls",
          "label": "Customer Calls",
          "kind": "external"
        },
        {
          "id": "stt",
          "label": "Call Transcription",
          "kind": "ai",
          "tech": "Speech-to-Text",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Transcripts & QA Scores",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "job",
          "label": "Scheduled QA Job",
          "kind": "function",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Summary & QA Scoring",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "looker",
          "label": "QA Dashboard",
          "kind": "analytics",
          "tech": "Looker",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "managers",
          "label": "Managers",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "calls",
          "to": "stt",
          "label": "call audio"
        },
        {
          "from": "stt",
          "to": "bq",
          "label": "transcripts"
        },
        {
          "from": "job",
          "to": "bq",
          "label": "read transcripts, write analysis"
        },
        {
          "from": "job",
          "to": "gemini",
          "label": "summarize & rate"
        },
        {
          "from": "bq",
          "to": "looker",
          "label": "trends"
        },
        {
          "from": "managers",
          "to": "looker",
          "label": "top agents, training calls"
        }
      ]
    }
  },
  {
    "id": "genai-bp-55",
    "title": "#55 \u00b7 Use AI to analyze complex commercial contracts",
    "category": "Blueprint #55 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a global telecommunications operator with thousands of complex interconnection agreements and vendor contracts. Your challenge is quickly finding specific commercial terms, obligations, or renewal dates buried within these dense legal documents. (Tech stack: Document AI, Vertex AI Search, Vertex AI)",
    "dataflow": [
      "Thousands of contracts are processed by Document AI to extract and structure the raw text, which is then indexed into Vertex AI Search",
      "A member of the legal or commercial team uses a search interface and asks a natural language question like, \"Find all contracts with Operator X that have a termination clause requiring 90 days' notice.\"",
      "Vertex AI Search retrieves the relevant contract sections",
      "For further analysis, Gemini can be used to compare terms across multiple retrieved documents in a side-by-side table"
    ],
    "keywords": [
      "55",
      "blueprint",
      "use",
      "analyze",
      "complex",
      "commercial",
      "contracts",
      "telecommunications",
      "tech",
      "secops",
      "document",
      "vertex",
      "search"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #55: Use AI to analyze complex commercial contracts using Document AI, Vertex AI Search, Vertex AI",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#55 \u00b7 Use AI to analyze complex commercial contracts",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (Document AI, Vertex AI Search, Vertex AI)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "contracts",
          "label": "Contract Repository",
          "kind": "external"
        },
        {
          "id": "docai",
          "label": "Contract Parsing",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "search",
          "label": "Contract Search",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "legal",
          "label": "Legal & Commercial Team",
          "kind": "user"
        },
        {
          "id": "gemini",
          "label": "Term Comparison",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "contracts",
          "to": "docai",
          "label": "thousands of contracts"
        },
        {
          "from": "docai",
          "to": "search",
          "label": "structured text, indexed"
        },
        {
          "from": "legal",
          "to": "search",
          "label": "natural-language question"
        },
        {
          "from": "search",
          "to": "gemini",
          "label": "retrieved sections \u2192 side-by-side table"
        }
      ]
    }
  },
  {
    "id": "genai-bp-56",
    "title": "#56 \u00b7 Build a \"network as code\" platform for developers",
    "category": "Blueprint #56 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "code",
    "icon": "code",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a 5G network operator, and you want to enable developers to create innovative applications that leverage the unique capabilities of your network (e.g., low latency, high bandwidth). Your challenge is abstracting the complexity of the network into simple, programmable APIs. (Tech stack: Vertex AI, Google Kubernetes Engine (GKE), network APIs)",
    "dataflow": [
      "A \"Network as Code\" platform exposes complex network functions via simple APIs, hosted on GKE",
      "A developer wants to build a telehealth app that requires a guaranteed high-quality connection for a remote surgery consultation",
      "They use the platform's SDK and interact with a Gemini -powered assistant, prompting, \"Generate the Python code to request a dedicated, low-latency network slice between the hospital and the patient's home for the next 60 minutes.\"",
      "Gemini generates the necessary code, which calls the platform's APIs to provision the network resources dynamically"
    ],
    "keywords": [
      "56",
      "blueprint",
      "build",
      "network",
      "code",
      "platform",
      "for",
      "developers",
      "telecommunications",
      "tech",
      "secops",
      "vertex",
      "google",
      "kubernetes",
      "engine",
      "gke",
      "apis"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #56: Build a \"network as code\" platform for developers using Vertex AI, Google Kubernetes Engine (GKE), network APIs",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#56 \u00b7 Build a \"network as code\" platform for developers",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (Vertex AI, Google Kubernetes Engine (GKE), network APIs)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "developer",
          "label": "Developer",
          "kind": "user"
        },
        {
          "id": "sdk",
          "label": "Platform SDK",
          "kind": "client"
        },
        {
          "id": "gemini",
          "label": "Code Assistant",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gke",
          "label": "Network-as-Code APIs",
          "kind": "container",
          "tech": "Google Kubernetes Engine",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "network",
          "label": "Network Functions",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "developer",
          "to": "sdk",
          "label": "prompt"
        },
        {
          "from": "sdk",
          "to": "gemini",
          "label": "generate Python code"
        },
        {
          "from": "sdk",
          "to": "gke",
          "label": "API calls"
        },
        {
          "from": "gke",
          "to": "network",
          "label": "provision network slice"
        }
      ]
    }
  },
  {
    "id": "genai-bp-57",
    "title": "#57 \u00b7 Create a unified customer view for enhanced service",
    "category": "Blueprint #57 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a large telecom provider, and your customer data is fragmented across multiple systems (billing, CRM, network usage). Your challenge is creating a single, 360-degree view of each customer to provide proactive, personalized service and make informed business decisions. (Tech stack: BigQuery, Dataflow, Vertex AI, Looker)",
    "dataflow": [
      "Data from all source systems is streamed via Dataflow into BigQuery, which acts as the central data warehouse",
      "Vertex AI models analyze the unified data to identify patterns, such as a customer experiencing poor network quality in a specific location",
      "The system can then create an actionable insight, like \"This customer is at high risk of churn due to repeated dropped calls.\"",
      "This insight is surfaced to a customer service agent via a Looker dashboard, prompting them to proactively reach out with a solution, like offering a network extender"
    ],
    "keywords": [
      "57",
      "blueprint",
      "create",
      "unified",
      "customer",
      "view",
      "for",
      "enhanced",
      "service",
      "telecommunications",
      "tech",
      "secops",
      "bigquery",
      "dataflow",
      "vertex",
      "looker"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #57: Create a unified customer view for enhanced service using BigQuery, Dataflow, Vertex AI, Looker",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#57 \u00b7 Create a unified customer view for enhanced service",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (BigQuery, Dataflow, Vertex AI, Looker)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "sources",
          "label": "Source Systems",
          "kind": "external"
        },
        {
          "id": "df",
          "label": "Streaming Ingest",
          "kind": "analytics",
          "tech": "Dataflow",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Customer Data Warehouse",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Churn & Network Models",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "looker",
          "label": "Agent Dashboard",
          "kind": "analytics",
          "tech": "Looker",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "agent",
          "label": "Service Agent",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "sources",
          "to": "df",
          "label": "all customer data"
        },
        {
          "from": "df",
          "to": "bq",
          "label": "unified data"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "patterns"
        },
        {
          "from": "vertex",
          "to": "looker",
          "label": "churn-risk insights"
        },
        {
          "from": "agent",
          "to": "looker",
          "label": "proactive outreach"
        }
      ]
    }
  },
  {
    "id": "genai-bp-58",
    "title": "#58 \u00b7 Enable natural language chat for complex IoT data",
    "category": "Blueprint #58 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an Internet of Things (IoT) provider for commercial clients, collecting millions of data points from sensors and devices. Your challenge is that non-technical users, like fleet managers or building operators, cannot easily access or understand this complex data to get the insights they need. (Tech stack: BigQuery, Vertex AI, Looker (or another BI tool))",
    "dataflow": [
      "All IoT data is streamed and stored in BigQuery",
      "The data is exposed through a BI tool like Looker with an embedded natural language chat interface",
      "A non-technical user asks a question in plain English, such as \"Which of our vehicles have been idling for more than 30 minutes today in the downtown area?\"",
      "The request is sent to Gemini, which understands the user's intent and translates the question into a SQL query",
      "The query is run against BigQuery, and the results are returned as a simple table or map directly in the chat interface, reducing time-to-insight by 88%"
    ],
    "keywords": [
      "58",
      "blueprint",
      "enable",
      "natural",
      "language",
      "chat",
      "for",
      "complex",
      "iot",
      "data",
      "telecommunications",
      "tech",
      "secops",
      "bigquery",
      "vertex",
      "looker",
      "another",
      "tool"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #58: Enable natural language chat for complex IoT data using BigQuery, Vertex AI, Looker (or another BI tool)",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#58 \u00b7 Enable natural language chat for complex IoT data",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (BigQuery, Vertex AI, Looker (or another BI tool))",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "iot",
          "label": "IoT Devices",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "IoT Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "looker",
          "label": "BI Chat",
          "kind": "analytics",
          "tech": "Looker",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "NL to SQL",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "user",
          "label": "Business User",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "iot",
          "to": "bq",
          "label": "streamed data"
        },
        {
          "from": "user",
          "to": "looker",
          "label": "plain-English question"
        },
        {
          "from": "looker",
          "to": "gemini",
          "label": "intent \u2192 SQL"
        },
        {
          "from": "looker",
          "to": "bq",
          "label": "run query \u2192 table or map"
        }
      ]
    }
  },
  {
    "id": "genai-bp-59",
    "title": "#59 \u00b7 Deliver AI services on a distributed cloud for data sovereignty",
    "category": "Blueprint #59 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a multinational telecom operator serving countries with strict data residency laws. Your challenge is to leverage powerful AI capabilities, like real-time translation, while ensuring that local customer data never leaves the country of origin. (Tech stack: Google Distributed Cloud, Vertex AI, Speech-to-Text, Text-to-Speech)",
    "dataflow": [
      "An instance of Google Distributed Cloud (GDC) is deployed within the local country's data center",
      "A user makes a call that requires real-time translation",
      "The audio stream is processed entirely within the GDC environment",
      "Speech-to-Text and Text-to-Speech services, along with Vertex AI translation models running on GDC, handle the translation",
      "The translated audio is sent back to the user with super-low latency, delivering the AI service while guaranteeing all data remains in-country to comply with sovereignty regulations"
    ],
    "keywords": [
      "59",
      "blueprint",
      "deliver",
      "services",
      "distributed",
      "cloud",
      "for",
      "data",
      "sovereignty",
      "telecommunications",
      "tech",
      "secops",
      "google",
      "vertex",
      "speech",
      "text"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #59: Deliver AI services on a distributed cloud for data sovereignty using Google Distributed Cloud, Vertex AI, Speech-to-Text, Text-to-Speech",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#59 \u00b7 Deliver AI services on a distributed cloud for data sovereignty",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (Google Distributed Cloud, Vertex AI, Speech-to-Text, Text-to-Speech)",
      "groups": [
        {
          "id": "gdc",
          "label": "Google Distributed Cloud (in-country data center)",
          "kind": "boundary"
        }
      ],
      "nodes": [
        {
          "id": "caller",
          "label": "Caller",
          "kind": "user"
        },
        {
          "id": "stt",
          "label": "Speech Recognition",
          "kind": "ai",
          "tech": "Speech-to-Text on Google Distributed Cloud",
          "provider": "gcp",
          "group": "gdc"
        },
        {
          "id": "vertex",
          "label": "Translation Model",
          "kind": "ai",
          "tech": "Vertex AI on Google Distributed Cloud",
          "provider": "gcp",
          "group": "gdc"
        },
        {
          "id": "tts",
          "label": "Speech Synthesis",
          "kind": "ai",
          "tech": "Text-to-Speech on Google Distributed Cloud",
          "provider": "gcp",
          "group": "gdc"
        },
        {
          "id": "listener",
          "label": "Other Party",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "caller",
          "to": "stt",
          "label": "audio stream"
        },
        {
          "from": "stt",
          "to": "vertex",
          "label": "text"
        },
        {
          "from": "vertex",
          "to": "tts",
          "label": "translated text"
        },
        {
          "from": "tts",
          "to": "listener",
          "label": "translated audio"
        }
      ]
    }
  },
  {
    "id": "genai-bp-60",
    "title": "#60 \u00b7 Accelerate cybersecurity threat detection and response",
    "category": "Blueprint #60 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "security",
    "icon": "security",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a critical infrastructure provider, and you face a constant barrage of sophisticated cyber threats. Your challenge is detecting and investigating these threats fast enough to prevent breaches, a task that is difficult for human analysts to manage at scale. (Tech stack: Google Security Operations (SecOps), Gemini in Security)",
    "dataflow": [
      "Security logs and telemetry from across the entire organization are ingested into the Google Security Operations platform",
      "The platform's AI capabilities automatically correlate signals to detect potential threats that a human might miss",
      "When a high-priority event is detected, a security analyst can use the integrated Gemini in Security to ask, \"Summarize this threat. What is the potential impact, and what is the recommended remediation?\"",
      "Gemini provides a concise summary and a step-by-step playbook, allowing the analyst to close investigations faster"
    ],
    "keywords": [
      "60",
      "blueprint",
      "accelerate",
      "cybersecurity",
      "threat",
      "detection",
      "and",
      "response",
      "telecommunications",
      "tech",
      "secops",
      "google",
      "security",
      "operations",
      "gemini"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #60: Accelerate cybersecurity threat detection and response using Google Security Operations (SecOps), Gemini in Security",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#60 \u00b7 Accelerate cybersecurity threat detection and response",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (Google Security Operations (SecOps), Gemini in Security)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "sources",
          "label": "Org Logs & Telemetry",
          "kind": "external"
        },
        {
          "id": "secops",
          "label": "Threat Detection",
          "kind": "security",
          "tech": "Google Security Operations",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Threat Summary & Playbook",
          "kind": "ai",
          "tech": "Gemini in Security",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "analyst",
          "label": "Security Analyst",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "sources",
          "to": "secops",
          "label": "logs & telemetry"
        },
        {
          "from": "secops",
          "to": "analyst",
          "label": "high-priority alert"
        },
        {
          "from": "secops",
          "to": "gemini",
          "label": "case context",
          "style": "dashed"
        },
        {
          "from": "analyst",
          "to": "gemini",
          "label": "summarize threat, remediation?"
        }
      ]
    }
  },
  {
    "id": "genai-bp-61",
    "title": "#61 \u00b7 Establish data-driven AI security governance",
    "category": "Blueprint #61 \u00b7 Telecommunications, Tech & SecOps",
    "agentCategory": "security",
    "icon": "security",
    "industries": [
      "Telecommunications, Tech & SecOps"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a large enterprise with thousands of internal developers and data scientists building AI models. Your challenge is establishing a robust governance layer to ensure that all AI development is secure, compliant, and data-driven without stifling innovation. (Tech stack: Vertex AI, BigQuery, open-source tools (e.g., for model scanning), IAM)",
    "dataflow": [
      "All AI model development is done within Vertex AI",
      "As models are built, their metadata, training data sources, and dependencies are automatically logged in BigQuery",
      "Automated security tools scan models for vulnerabilities",
      "A governance dashboard provides a single view of all AI projects, showing compliance status and data lineage",
      "IAM policies enforce rules, such as \"a model cannot be deployed to production if it was trained on unapproved customer data,\" creating a robust, data-driven governance framework"
    ],
    "keywords": [
      "61",
      "blueprint",
      "establish",
      "data",
      "driven",
      "security",
      "governance",
      "telecommunications",
      "tech",
      "secops",
      "vertex",
      "bigquery",
      "open",
      "source",
      "tools",
      "for",
      "model",
      "scanning",
      "iam"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #61: Establish data-driven AI security governance using Vertex AI, BigQuery, open-source tools (e.g., for model scanning), IAM",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#61 \u00b7 Establish data-driven AI security governance",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Telecommunications, Tech & SecOps (Vertex AI, BigQuery, open-source tools (e.g., for model scanning), IAM)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "scientists",
          "label": "Data Scientists",
          "kind": "user"
        },
        {
          "id": "vertex",
          "label": "Model Development",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "scanners",
          "label": "Model Scanners (open source)",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Metadata & Lineage",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "dash",
          "label": "Governance Dashboard",
          "kind": "client"
        },
        {
          "id": "iam",
          "label": "Deployment Policies",
          "kind": "security",
          "tech": "Identity and Access Management",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "scientists",
          "to": "vertex",
          "label": "build models"
        },
        {
          "from": "vertex",
          "to": "bq",
          "label": "metadata, data sources, dependencies",
          "style": "dashed"
        },
        {
          "from": "vertex",
          "to": "scanners",
          "label": "models"
        },
        {
          "from": "scanners",
          "to": "bq",
          "label": "vulnerability findings"
        },
        {
          "from": "bq",
          "to": "dash",
          "label": "compliance & lineage"
        },
        {
          "from": "iam",
          "to": "vertex",
          "label": "production deploy rules",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-62",
    "title": "#62 \u00b7 Build a conversational AI travel agent",
    "category": "Blueprint #62 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an airline or online travel agency. Your challenge is that traditional booking websites with complex filters and forms can be frustrating and impersonal for travelers who just want to ask a simple question, leading to abandoned searches and lost bookings. (Tech stack: Vertex AI, Cloud Run, backend booking system APIs)",
    "dataflow": [
      "A traveler interacts with a chatbot on the website or app, asking, \"I want to fly from Seattle to Miami next month for about $400.\"",
      "The request is sent to a service on Cloud Run, which uses Vertex AI Agent Builder to understand the user's intent and extract entities (origin, destination, date, price)",
      "The service calls the airline's booking APIs to find matching flights",
      "The flight options are passed to Gemini with a prompt like, \"Here are three flights. Present them in a friendly, conversational way and ask the user which one they prefer.\"",
      "The chatbot presents the options, streamlining the booking process into a simple conversation"
    ],
    "keywords": [
      "62",
      "blueprint",
      "build",
      "conversational",
      "travel",
      "agent",
      "hospitality",
      "media",
      "vertex",
      "cloud",
      "run",
      "backend",
      "booking",
      "system",
      "apis"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #62: Build a conversational AI travel agent using Vertex AI, Cloud Run, backend booking system APIs",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#62 \u00b7 Build a conversational AI travel agent",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (Vertex AI, Cloud Run, backend booking system APIs)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "traveler",
          "label": "Traveler",
          "kind": "user"
        },
        {
          "id": "chat",
          "label": "Website / App Chat",
          "kind": "client"
        },
        {
          "id": "run",
          "label": "Travel Agent Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "agent",
          "label": "Intent & Entities",
          "kind": "ai",
          "tech": "Vertex AI Agent Builder",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "booking",
          "label": "Airline Booking APIs",
          "kind": "external"
        },
        {
          "id": "gemini",
          "label": "Conversational Options",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "traveler",
          "to": "chat",
          "label": "trip request"
        },
        {
          "from": "chat",
          "to": "run",
          "label": "message"
        },
        {
          "from": "run",
          "to": "agent",
          "label": "origin, destination, date, price"
        },
        {
          "from": "run",
          "to": "booking",
          "label": "flight search"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "flights \u2192 friendly options"
        }
      ]
    }
  },
  {
    "id": "genai-bp-63",
    "title": "#63 \u00b7 Create an in-park digital assistant for theme parks",
    "category": "Blueprint #63 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a theme park or large entertainment venue operator. Your challenge is that guests can feel overwhelmed trying to navigate the park, find showtimes, and check ride wait times, which can detract from their overall experience. (Tech stack: Google Maps Platform, Vertex AI, BigQuery, Cloud Run)",
    "dataflow": [
      "Real-time park data (ride wait times, show schedules, character locations) is streamed into BigQuery",
      "A guest opens the park's mobile app and asks the digital assistant, \"What's a fun ride with a wait time under 20 minutes near me?\"",
      "The app sends the request and the user's location to a service on Cloud Run",
      "The service queries BigQuery for current wait times and uses the Google Maps Platform to find nearby attractions",
      "Gemini synthesizes this information to provide a personalized recommendation, such as, \"The Goliath roller coaster is a 5-minute walk from you and has a 15-minute wait!\""
    ],
    "keywords": [
      "63",
      "blueprint",
      "create",
      "park",
      "digital",
      "assistant",
      "for",
      "theme",
      "parks",
      "hospitality",
      "travel",
      "media",
      "google",
      "maps",
      "platform",
      "vertex",
      "bigquery",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #63: Create an in-park digital assistant for theme parks using Google Maps Platform, Vertex AI, BigQuery, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#63 \u00b7 Create an in-park digital assistant for theme parks",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (Google Maps Platform, Vertex AI, BigQuery, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "park",
          "label": "Park Systems",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Wait Times & Schedules",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "guest",
          "label": "Guest",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Park App",
          "kind": "mobile"
        },
        {
          "id": "run",
          "label": "Assistant Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "maps",
          "label": "Nearby Attractions",
          "kind": "api",
          "tech": "Google Maps Platform",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Recommendation",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "park",
          "to": "bq",
          "label": "real-time park data"
        },
        {
          "from": "guest",
          "to": "app",
          "label": "question"
        },
        {
          "from": "app",
          "to": "run",
          "label": "request & location"
        },
        {
          "from": "run",
          "to": "bq",
          "label": "current wait times"
        },
        {
          "from": "run",
          "to": "maps",
          "label": "nearby attractions"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "personalized recommendation"
        }
      ]
    }
  },
  {
    "id": "genai-bp-64",
    "title": "#64 \u00b7 Build predictive tools for food orders and loyalty",
    "category": "Blueprint #64 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a quick-service restaurant or pizza chain. Your challenge is managing inventory and kitchen prep time effectively during peak hours while also encouraging repeat business through generic loyalty programs that often fail to engage customers. (Tech stack: BigQuery, Vertex AI, Cloud Run)",
    "dataflow": [
      "All historical order data is stored in BigQuery",
      "Vertex AI forecasting models analyze this data to predict order volumes for specific times and locations (e.g., \"Predict a 30% spike in pepperoni pizza orders in downtown locations on Friday night\" )",
      "When a loyalty member opens the app, a service on Cloud Run retrieves their order history and sends it to Gemini with a prompt like, \"This user frequently orders on Tuesdays. Create a personalized offer for a free side item with their next Tuesday order.\"",
      "This predictive prep and personalized marketing increases efficiency and customer loyalty"
    ],
    "keywords": [
      "64",
      "blueprint",
      "build",
      "predictive",
      "tools",
      "for",
      "food",
      "orders",
      "and",
      "loyalty",
      "hospitality",
      "travel",
      "media",
      "bigquery",
      "vertex",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #64: Build predictive tools for food orders and loyalty using BigQuery, Vertex AI, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#64 \u00b7 Build predictive tools for food orders and loyalty",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (BigQuery, Vertex AI, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "orders",
          "label": "Order Systems",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Order History",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "forecast",
          "label": "Order Volume Forecast",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "kitchens",
          "label": "Store Prep Plans",
          "kind": "external"
        },
        {
          "id": "member",
          "label": "Loyalty Member",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Ordering App",
          "kind": "mobile"
        },
        {
          "id": "run",
          "label": "Offer Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Personalized Offers",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "orders",
          "to": "bq",
          "label": "all orders"
        },
        {
          "from": "bq",
          "to": "forecast",
          "label": "history"
        },
        {
          "from": "forecast",
          "to": "kitchens",
          "label": "predicted volumes"
        },
        {
          "from": "member",
          "to": "app",
          "label": "opens app"
        },
        {
          "from": "app",
          "to": "run",
          "label": "member ID"
        },
        {
          "from": "run",
          "to": "bq",
          "label": "order history"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "offer prompt"
        }
      ]
    }
  },
  {
    "id": "genai-bp-65",
    "title": "#65 \u00b7 Enable natural language search for accommodations",
    "category": "Blueprint #65 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a hotel booking platform or vacation rental site. Your challenge is that users often have specific, nuanced needs (like \"a quiet hotel near the beach with a pool for kids\") that are difficult to express using standard check-box filters. (Tech stack: Vertex AI Search, BigQuery)",
    "dataflow": [
      "Detailed data for millions of hotel listings, including amenities, reviews, and location info, is indexed from BigQuery into Vertex AI Search",
      "A user types a free-text query like, \"Find me a pet-friendly hotel in downtown Austin with a rooftop bar for under $300 a night.\"",
      "Vertex AI Search processes the natural language to understand the multiple intents (pet-friendly, location, amenity, price)",
      "The engine returns a ranked list of hotels that best match all the specified criteria, creating a more intuitive and personalized search experience"
    ],
    "keywords": [
      "65",
      "blueprint",
      "enable",
      "natural",
      "language",
      "search",
      "for",
      "accommodations",
      "hospitality",
      "travel",
      "media",
      "vertex",
      "bigquery"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #65: Enable natural language search for accommodations using Vertex AI Search, BigQuery",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#65 \u00b7 Enable natural language search for accommodations",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (Vertex AI Search, BigQuery)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "bq",
          "label": "Hotel Listings",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "search",
          "label": "Accommodation Search",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "traveler",
          "label": "Traveler",
          "kind": "user"
        },
        {
          "id": "site",
          "label": "Travel Site",
          "kind": "client"
        }
      ],
      "edges": [
        {
          "from": "bq",
          "to": "search",
          "label": "indexed listings",
          "style": "dashed"
        },
        {
          "from": "traveler",
          "to": "site",
          "label": "free-text query"
        },
        {
          "from": "site",
          "to": "search",
          "label": "query \u2192 ranked hotels"
        }
      ]
    }
  },
  {
    "id": "genai-bp-66",
    "title": "#66 \u00b7 Create an AI-driven virtual fitness coach",
    "category": "Blueprint #66 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a fitness brand or gym, and your customers want personalized training plans. Your challenge is that providing one-on-one human coaching is expensive and doesn't scale, leaving most members with generic, one-size-fits-all workout programs. (Tech stack: Vertex AI, a mobile application, wearable device integration)",
    "dataflow": [
      "A user inputs their fitness goals and performs a series of assessment exercises, which are recorded through their phone's camera",
      "A computer vision model on Vertex AI analyzes the video to assess form and fitness level",
      "This data, along with input from their wearable device, is sent to a Gemini model with a prompt like, \"Create a 4-week progressive fitness program for a user with intermediate strength whose goal is fat loss.\"",
      "The AI generates a hyper-personalized daily workout program, acting as a virtual trainer that adapts over time based on the user's performance"
    ],
    "keywords": [
      "66",
      "blueprint",
      "create",
      "driven",
      "virtual",
      "fitness",
      "coach",
      "hospitality",
      "travel",
      "media",
      "vertex",
      "mobile",
      "application",
      "wearable",
      "device",
      "integration"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #66: Create an AI-driven virtual fitness coach using Vertex AI, a mobile application, wearable device integration",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#66 \u00b7 Create an AI-driven virtual fitness coach",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (Vertex AI, a mobile application, wearable device integration)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "user",
          "label": "User",
          "kind": "user"
        },
        {
          "id": "phone",
          "label": "Phone Camera & App",
          "kind": "mobile"
        },
        {
          "id": "wearable",
          "label": "Wearable Device",
          "kind": "external"
        },
        {
          "id": "vision",
          "label": "Form & Fitness Analysis",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Program Generator",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "user",
          "to": "phone",
          "label": "goals & exercise video"
        },
        {
          "from": "phone",
          "to": "vision",
          "label": "video"
        },
        {
          "from": "vision",
          "to": "gemini",
          "label": "assessment"
        },
        {
          "from": "wearable",
          "to": "gemini",
          "label": "activity data"
        },
        {
          "from": "gemini",
          "to": "phone",
          "label": "daily workout program",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-67",
    "title": "#67 \u00b7 Personalize advertising campaigns at scale",
    "category": "Blueprint #67 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a global hotel group, and you need to run advertising campaigns across many different regions and customer segments. Your challenge is creating ad copy and imagery that resonates with each specific audience, a task that is slow and difficult to scale manually. (Tech stack: BigQuery, Vertex AI, Google Ads API)",
    "dataflow": [
      "Customer and campaign performance data is consolidated in BigQuery",
      "The marketing team defines a new campaign with a target audience, such as \"families looking for a summer vacation in Spain.\"",
      "A service sends this context to Gemini with a prompt like, \"Generate 5 different ad headlines and descriptions for a family-friendly hotel in Barcelona, highlighting the pool and proximity to attractions.\"",
      "Gemini creates multiple ad variations, which are then automatically pushed to the Google Ads API to create a highly targeted and personalized campaign, boosting ad team productivity and revenue"
    ],
    "keywords": [
      "67",
      "blueprint",
      "personalize",
      "advertising",
      "campaigns",
      "scale",
      "hospitality",
      "travel",
      "media",
      "bigquery",
      "vertex",
      "google",
      "ads",
      "api"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #67: Personalize advertising campaigns at scale using BigQuery, Vertex AI, Google Ads API",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#67 \u00b7 Personalize advertising campaigns at scale",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (BigQuery, Vertex AI, Google Ads API)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "team",
          "label": "Marketing Team",
          "kind": "user"
        },
        {
          "id": "bq",
          "label": "Customer & Campaign Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "svc",
          "label": "Campaign Service",
          "kind": "service",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Ad Copy Generator",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "ads",
          "label": "Google Ads",
          "kind": "api",
          "tech": "Google Ads API"
        }
      ],
      "edges": [
        {
          "from": "team",
          "to": "svc",
          "label": "campaign brief"
        },
        {
          "from": "bq",
          "to": "svc",
          "label": "performance data"
        },
        {
          "from": "svc",
          "to": "gemini",
          "label": "ad prompt"
        },
        {
          "from": "svc",
          "to": "ads",
          "label": "ad variations"
        }
      ]
    }
  },
  {
    "id": "genai-bp-68",
    "title": "#68 \u00b7 Automate data governance for airline operations",
    "category": "Blueprint #68 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a major airline dealing with petabytes of data from dozens of systems, from flight operations to customer loyalty. Your challenge is managing and governing this data, as manually classifying tables and managing metadata is a massive, costly, and error-prone undertaking. (Tech stack: BigQuery, Gemini, Dataplex)",
    "dataflow": [
      "As new data tables are created in BigQuery, a process is triggered",
      "The table schema and sample data are sent to a Gemini model with a prompt like, \"Analyze this table and generate a business-friendly description, assign data quality rules, and classify any columns that contain PII.\"",
      "The model returns structured metadata",
      "This metadata is used to automatically populate the Dataplex data catalog, ensuring all data is properly documented, classified, and governed without significant manual effort"
    ],
    "keywords": [
      "68",
      "blueprint",
      "automate",
      "data",
      "governance",
      "for",
      "airline",
      "operations",
      "hospitality",
      "travel",
      "media",
      "bigquery",
      "gemini",
      "dataplex"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #68: Automate data governance for airline operations using BigQuery, Gemini, Dataplex",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#68 \u00b7 Automate data governance for airline operations",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (BigQuery, Gemini, Dataplex)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "bq",
          "label": "New BigQuery Tables",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "trigger",
          "label": "Metadata Trigger",
          "kind": "function",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Metadata Generation",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "dataplex",
          "label": "Data Catalog",
          "kind": "analytics",
          "tech": "Dataplex",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "bq",
          "to": "trigger",
          "label": "table created",
          "style": "dashed"
        },
        {
          "from": "trigger",
          "to": "gemini",
          "label": "schema & sample data"
        },
        {
          "from": "trigger",
          "to": "dataplex",
          "label": "descriptions, quality rules, PII tags"
        }
      ]
    }
  },
  {
    "id": "genai-bp-69",
    "title": "#69 \u00b7 Automatically classify real-time traveler security alerts",
    "category": "Blueprint #69 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "security",
    "icon": "security",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a tour operator responsible for the safety of thousands of travelers around the world. Your challenge is monitoring and filtering a high volume of global security alerts to identify the ones that pose an actual, immediate risk to your specific customers. (Tech stack: Vertex AI, Pub/Sub, a traveler itinerary database)",
    "dataflow": [
      "A stream of global security alerts from various news and government sources flows into Pub/Sub",
      "For each alert, a function is triggered that retrieves the location and topic",
      "The function queries the itinerary database to see if any travelers are currently in the affected area",
      "If there are, the alert text is sent to Gemini with a prompt like, \"Based on this alert about a protest in Paris, classify the risk level for a tourist located 5 miles away as 'Low', 'Medium', or 'High'.\"",
      "The classified alert appears on a security dashboard, allowing the team to ignore low-risk noise and focus only on credible threats, reducing manual effort"
    ],
    "keywords": [
      "69",
      "blueprint",
      "automatically",
      "classify",
      "real",
      "time",
      "traveler",
      "security",
      "alerts",
      "hospitality",
      "travel",
      "media",
      "vertex",
      "pub",
      "sub",
      "itinerary",
      "database"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #69: Automatically classify real-time traveler security alerts using Vertex AI, Pub/Sub, a traveler itinerary database",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#69 \u00b7 Automatically classify real-time traveler security alerts",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (Vertex AI, Pub/Sub, a traveler itinerary database)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "feeds",
          "label": "News & Government Alerts",
          "kind": "external"
        },
        {
          "id": "ps",
          "label": "Alert Stream",
          "kind": "queue",
          "tech": "Pub/Sub",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "fn",
          "label": "Alert Triage Function",
          "kind": "function",
          "group": "gcp"
        },
        {
          "id": "itinerary",
          "label": "Traveler Itinerary Database",
          "kind": "database"
        },
        {
          "id": "gemini",
          "label": "Risk Classification",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "dash",
          "label": "Security Dashboard",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "feeds",
          "to": "ps",
          "label": "global alerts"
        },
        {
          "from": "ps",
          "to": "fn",
          "label": "each alert",
          "style": "dashed"
        },
        {
          "from": "fn",
          "to": "itinerary",
          "label": "travelers in the area"
        },
        {
          "from": "fn",
          "to": "gemini",
          "label": "alert text \u2192 Low / Medium / High"
        },
        {
          "from": "fn",
          "to": "dash",
          "label": "classified alert"
        }
      ]
    }
  },
  {
    "id": "genai-bp-70",
    "title": "#70 \u00b7 Streamline guest services with an AI data analyst",
    "category": "Blueprint #70 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a property manager for vacation rentals or corporate housing. Your challenge is that new arrivals frequently call with the same set of questions (e.g., \"What's the wifi password?\", \"How does the thermostat work?\"), overwhelming your support staff. (Tech stack: Gemini for Google Workspace, a call logging system)",
    "dataflow": [
      "All support call logs and transcripts are consolidated into a central Google Sheet",
      "A manager uses the integrated Gemini feature with a prompt like, \"Analyze all the calls from the last 30 days and identify the top 5 most common questions asked by new arrivals.\"",
      "Gemini analyzes the text and returns a summary, revealing that \"Wifi password\" is the most common issue",
      "The business can then take proactive steps, like sending a more prominent welcome email with the wifi details, leading to a reduction in these repetitive calls"
    ],
    "keywords": [
      "70",
      "blueprint",
      "streamline",
      "guest",
      "services",
      "with",
      "data",
      "analyst",
      "hospitality",
      "travel",
      "media",
      "gemini",
      "for",
      "google",
      "workspace",
      "call",
      "logging",
      "system"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #70: Streamline guest services with an AI data analyst using Gemini for Google Workspace, a call logging system",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#70 \u00b7 Streamline guest services with an AI data analyst",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (Gemini for Google Workspace, a call logging system)",
      "groups": [
        {
          "id": "ws",
          "label": "Google Workspace",
          "kind": "boundary"
        }
      ],
      "nodes": [
        {
          "id": "logs",
          "label": "Call Logging System",
          "kind": "external"
        },
        {
          "id": "sheet",
          "label": "Call Log Sheet",
          "kind": "client",
          "tech": "Google Sheets",
          "group": "ws"
        },
        {
          "id": "gemini",
          "label": "Gemini in Sheets",
          "kind": "ai",
          "tech": "Gemini for Google Workspace",
          "provider": "gcp",
          "group": "ws"
        },
        {
          "id": "manager",
          "label": "Guest Services Manager",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "logs",
          "to": "sheet",
          "label": "logs & transcripts"
        },
        {
          "from": "sheet",
          "to": "gemini",
          "label": "call data"
        },
        {
          "from": "manager",
          "to": "gemini",
          "label": "top 5 questions?"
        }
      ]
    }
  },
  {
    "id": "genai-bp-71",
    "title": "#71 \u00b7 Generate AI-powered video ad content",
    "category": "Blueprint #71 \u00b7 Hospitality, Travel & Media",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Hospitality, Travel & Media"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an airline's marketing team, and you need a constant stream of fresh video content to promote various destinations for in-flight entertainment and online ads. Your challenge is that traditional video production is expensive and time-consuming. (Tech stack: Google's Veo, Vertex AI)",
    "dataflow": [
      "The marketing team identifies a destination to promote, for example, \"Kyoto in autumn.\"",
      "They use Gemini to brainstorm concepts and generate a script, with a prompt like, \"Create a 30-second video script about the serene beauty of Kyoto's temples during autumn.\"",
      "This script, along with reference images and style guides, is then fed into Veo, Google's generative video model",
      "Veo generates a high-quality video clip based on the text and image prompts, allowing the team to create new, compelling ad content in a fraction of the time and cost of a traditional film shoot"
    ],
    "keywords": [
      "71",
      "blueprint",
      "generate",
      "powered",
      "video",
      "content",
      "hospitality",
      "travel",
      "media",
      "google",
      "veo",
      "vertex"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #71: Generate AI-powered video ad content using Google's Veo, Vertex AI",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#71 \u00b7 Generate AI-powered video ad content",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Hospitality, Travel & Media (Google's Veo, Vertex AI)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "team",
          "label": "Marketing Team",
          "kind": "user"
        },
        {
          "id": "gemini",
          "label": "Concept & Script",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "refs",
          "label": "Reference Images & Style Guides",
          "kind": "external"
        },
        {
          "id": "veo",
          "label": "Video Generation",
          "kind": "ai",
          "tech": "Veo on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "team",
          "to": "gemini",
          "label": "destination concept"
        },
        {
          "from": "gemini",
          "to": "veo",
          "label": "video script"
        },
        {
          "from": "refs",
          "to": "veo",
          "label": "visual references"
        }
      ]
    }
  },
  {
    "id": "genai-bp-72",
    "title": "#72 \u00b7 Build a better, more responsive AI home companion robot",
    "category": "Blueprint #72 \u00b7 Manufacturing & Agriculture",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Manufacturing & Agriculture"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a consumer electronics manufacturer looking to create a next-generation smart home product. Your challenge is moving beyond simple voice commands to create a truly helpful home companion that can understand natural conversation and interact intelligently with its environment. (Tech stack: Vertex AI, on-device AI models, Home API)",
    "dataflow": [
      "The home robot (\"Max\") uses on-device microphones to capture a user's command via the Speech-to-Text API",
      "The user's request is sent to a Gemini model, which understands the conversational context and intent",
      "If the request is to control a smart home device (e.g., \"turn on the living room lights\"), Gemini sends the appropriate command to the Google Home Platform APIs",
      "Gemini generates a natural language response (e.g., \"Okay, I've turned the lights on for you.\"), which is converted to audio via the Text-to-Speech API and played through the robot's speakers"
    ],
    "keywords": [
      "72",
      "blueprint",
      "build",
      "better",
      "more",
      "responsive",
      "home",
      "companion",
      "robot",
      "manufacturing",
      "agriculture",
      "vertex",
      "device",
      "models",
      "api"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #72: Build a better, more responsive AI home companion robot using Vertex AI, on-device AI models, Home API",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#72 \u00b7 Build a better, more responsive AI home companion robot",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Manufacturing & Agriculture (Vertex AI, on-device AI models, Home API)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "household",
          "label": "Household Member",
          "kind": "user"
        },
        {
          "id": "robot",
          "label": "Home Robot (on-device models)",
          "kind": "mobile"
        },
        {
          "id": "stt",
          "label": "Speech Recognition",
          "kind": "ai",
          "tech": "Speech-to-Text",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Conversation & Intent",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "home",
          "label": "Smart Home Devices",
          "kind": "api",
          "tech": "Google Home APIs"
        },
        {
          "id": "tts",
          "label": "Spoken Reply",
          "kind": "ai",
          "tech": "Text-to-Speech",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "household",
          "to": "robot",
          "label": "voice command"
        },
        {
          "from": "robot",
          "to": "stt",
          "label": "captured audio"
        },
        {
          "from": "stt",
          "to": "gemini",
          "label": "request"
        },
        {
          "from": "gemini",
          "to": "home",
          "label": "device command"
        },
        {
          "from": "gemini",
          "to": "tts",
          "label": "reply \u2192 robot speakers"
        }
      ]
    }
  },
  {
    "id": "genai-bp-73",
    "title": "#73 \u00b7 Create an AI-powered product recommendation agent",
    "category": "Blueprint #73 \u00b7 Manufacturing & Agriculture",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Manufacturing & Agriculture"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a manufacturer of consumer products with a wide and varied catalog, like gardening supplies. Your challenge is that customers are often novices and don't know which specific product is right for their needs, leading to confusion and lost sales. (Tech stack: Vertex AI, BigQuery, Cloud Run)",
    "dataflow": [
      "Your entire product catalog, along with expert knowledge and guides, is indexed into Vertex AI Agent Builder from a source like BigQuery",
      "A customer interacts with the AI agent on your website, asking, \"My lawn has brown patches and I live in Texas. What should I do?\"",
      "The agent understands the user's intent and location",
      "The retrieved product information and user query are sent to Gemini to generate a helpful, step-by-step answer, such as \"It sounds like you have a grub problem, common in Texas this time of year. I recommend our product, and here's how to apply it...\", guiding the customer to the correct purchase"
    ],
    "keywords": [
      "73",
      "blueprint",
      "create",
      "powered",
      "product",
      "recommendation",
      "agent",
      "manufacturing",
      "agriculture",
      "vertex",
      "bigquery",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #73: Create an AI-powered product recommendation agent using Vertex AI, BigQuery, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#73 \u00b7 Create an AI-powered product recommendation agent",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Manufacturing & Agriculture (Vertex AI, BigQuery, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "bq",
          "label": "Catalog & Expert Guides",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "agent",
          "label": "Product Agent",
          "kind": "ai",
          "tech": "Vertex AI Agent Builder",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "customer",
          "label": "Customer",
          "kind": "user"
        },
        {
          "id": "site",
          "label": "Website Agent",
          "kind": "client"
        },
        {
          "id": "run",
          "label": "Agent Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Step-by-step Answer",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "bq",
          "to": "agent",
          "label": "indexed catalog",
          "style": "dashed"
        },
        {
          "from": "customer",
          "to": "site",
          "label": "question"
        },
        {
          "from": "site",
          "to": "run",
          "label": "query"
        },
        {
          "from": "run",
          "to": "agent",
          "label": "intent & location \u2192 products"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "products + question"
        }
      ]
    }
  },
  {
    "id": "genai-bp-74",
    "title": "#74 \u00b7 Automate industrial safety audits with AI",
    "category": "Blueprint #74 \u00b7 Manufacturing & Agriculture",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Manufacturing & Agriculture"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a global energy or manufacturing company, and conducting safety audits across dozens of facilities is a slow, manual, and expensive process. Your challenge is to streamline these audits to ensure compliance and safety without incurring massive costs and operational downtime. (Tech stack: Vertex AI, Google Cloud Storage, a mobile application)",
    "dataflow": [
      "An auditor on-site uses a mobile app to take photos and videos of equipment, which are uploaded to Google Cloud Storage",
      "Vertex AI Vision analyzes the imagery to identify equipment and check for visual compliance (e.g., \"is the safety guard in place?\")",
      "The visual data, along with text from checklists, is fed to a Gemini model that has been trained on the company's safety protocols",
      "The model automatically generates a complete audit report, flagging non-compliant items and citing the specific safety rule, reducing a two-week process to one hour"
    ],
    "keywords": [
      "74",
      "blueprint",
      "automate",
      "industrial",
      "safety",
      "audits",
      "with",
      "manufacturing",
      "agriculture",
      "vertex",
      "google",
      "cloud",
      "storage",
      "mobile",
      "application"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #74: Automate industrial safety audits with AI using Vertex AI, Google Cloud Storage, a mobile application",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#74 \u00b7 Automate industrial safety audits with AI",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Manufacturing & Agriculture (Vertex AI, Google Cloud Storage, a mobile application)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "auditor",
          "label": "Auditor",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Audit App",
          "kind": "mobile"
        },
        {
          "id": "gcs",
          "label": "Photos & Videos",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vision",
          "label": "Visual Compliance Check",
          "kind": "ai",
          "tech": "Vertex AI Vision",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Audit Report",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "auditor",
          "to": "app",
          "label": "site photos & videos"
        },
        {
          "from": "app",
          "to": "gcs",
          "label": "uploads"
        },
        {
          "from": "gcs",
          "to": "vision",
          "label": "imagery"
        },
        {
          "from": "vision",
          "to": "gemini",
          "label": "visual findings"
        },
        {
          "from": "app",
          "to": "gemini",
          "label": "checklist text"
        }
      ]
    }
  },
  {
    "id": "genai-bp-75",
    "title": "#75 \u00b7 Automate sales quotes for configurable products",
    "category": "Blueprint #75 \u00b7 Manufacturing & Agriculture",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Manufacturing & Agriculture"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a manufacturer of configurable products like solar panel systems. Your challenge is that creating an accurate quote is a slow, manual process requiring an expert to assess customer-specific variables (like roof size), which creates a bottleneck in your sales process. (Tech stack: Google Maps Platform (Aerial View API), Vertex AI, Document AI)",
    "dataflow": [
      "A prospective customer provides their address",
      "A service calls the Google Maps Aerial View API to get high-resolution imagery of the property's roof",
      "This imagery is analyzed by a Vertex AI model to measure the roof's dimensions and identify obstructions",
      "The system calculates the optimal number of solar panels and generates a quote",
      "If the customer uploads a utility bill via Document AI, the system can even calculate potential savings, delivering a complete, accurate quote in 15 minutes instead of two hours"
    ],
    "keywords": [
      "75",
      "blueprint",
      "automate",
      "sales",
      "quotes",
      "for",
      "configurable",
      "products",
      "manufacturing",
      "agriculture",
      "google",
      "maps",
      "platform",
      "aerial",
      "view",
      "api",
      "vertex",
      "document"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #75: Automate sales quotes for configurable products using Google Maps Platform (Aerial View API), Vertex AI, Document AI",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#75 \u00b7 Automate sales quotes for configurable products",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Manufacturing & Agriculture (Google Maps Platform (Aerial View API), Vertex AI, Document AI)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "customer",
          "label": "Customer",
          "kind": "user"
        },
        {
          "id": "svc",
          "label": "Quote Service",
          "kind": "service",
          "group": "gcp"
        },
        {
          "id": "maps",
          "label": "Roof Imagery",
          "kind": "api",
          "tech": "Google Maps Platform (Aerial View API)",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Roof Measurement",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "docai",
          "label": "Utility Bill Parsing",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "customer",
          "to": "svc",
          "label": "address & utility bill"
        },
        {
          "from": "svc",
          "to": "maps",
          "label": "property imagery"
        },
        {
          "from": "svc",
          "to": "vertex",
          "label": "roof dimensions & obstructions"
        },
        {
          "from": "svc",
          "to": "docai",
          "label": "utility bill \u2192 savings"
        }
      ]
    }
  },
  {
    "id": "genai-bp-76",
    "title": "#76 \u00b7 Democratize data access with a natural language to SQL agent",
    "category": "Blueprint #76 \u00b7 Manufacturing & Agriculture",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Manufacturing & Agriculture"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a large manufacturing enterprise with valuable data locked away in complex databases. Your challenge is that only a small number of technical employees can write SQL queries, creating a bottleneck and preventing business users from getting the insights they need. (Tech stack: BigQuery, Vertex AI, Looker or another BI tool)",
    "dataflow": [
      "All critical company data (e.g., SAP Materials data) is consolidated into BigQuery",
      "An employee uses an internal BI tool and types a natural language question, such as \"What was our total pulp production in Q2 for the southern region, and how does that compare to Q1?\"",
      "The question is sent to a Gemini model that has been trained on the company's BigQuery schema",
      "The model translates the natural language question into an accurate SQL query",
      "The query is automatically run against BigQuery, and the results are returned and visualized for the employee, reducing query time"
    ],
    "keywords": [
      "76",
      "blueprint",
      "democratize",
      "data",
      "access",
      "with",
      "natural",
      "language",
      "sql",
      "agent",
      "manufacturing",
      "agriculture",
      "bigquery",
      "vertex",
      "looker",
      "another",
      "tool"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #76: Democratize data access with a natural language to SQL agent using BigQuery, Vertex AI, Looker or another BI tool",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#76 \u00b7 Democratize data access with a natural language to SQL agent",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Manufacturing & Agriculture (BigQuery, Vertex AI, Looker or another BI tool)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "sap",
          "label": "SAP & Business Systems",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Company Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "employee",
          "label": "Employee",
          "kind": "user"
        },
        {
          "id": "bi",
          "label": "BI Tool",
          "kind": "analytics",
          "tech": "Looker",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "NL to SQL",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "sap",
          "to": "bq",
          "label": "consolidated data"
        },
        {
          "from": "employee",
          "to": "bi",
          "label": "natural-language question"
        },
        {
          "from": "bi",
          "to": "gemini",
          "label": "question & schema \u2192 SQL"
        },
        {
          "from": "bi",
          "to": "bq",
          "label": "run SQL \u2192 visualized results"
        }
      ]
    }
  },
  {
    "id": "genai-bp-77",
    "title": "#77 \u00b7 Build an AI-powered agricultural insights platform",
    "category": "Blueprint #77 \u00b7 Manufacturing & Agriculture",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Manufacturing & Agriculture"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a company in the agricultural science sector. Your challenge is helping farmers move from traditional farming methods to a more data-driven approach, enabling them to increase yields and operate more sustainably in the face of changing climate conditions. (Tech stack: BigQuery, Vertex AI, Google Earth Engine, IoT sensors)",
    "dataflow": [
      "Data from on-farm IoT sensors, satellite imagery from Google Earth Engine, and weather data are all consolidated into BigQuery",
      "Vertex AI models analyze this multi-layered dataset to generate hyper-local insights for a specific field",
      "A farmer receives a recommendation on their device, such as \"Your soil moisture in Section B is 15% below optimal. Based on the 7-day forecast, I recommend irrigating with 1 inch of water tomorrow morning to maximize yield.\""
    ],
    "keywords": [
      "77",
      "blueprint",
      "build",
      "powered",
      "agricultural",
      "insights",
      "platform",
      "manufacturing",
      "agriculture",
      "bigquery",
      "vertex",
      "google",
      "earth",
      "engine",
      "iot",
      "sensors"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #77: Build an AI-powered agricultural insights platform using BigQuery, Vertex AI, Google Earth Engine, IoT sensors",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#77 \u00b7 Build an AI-powered agricultural insights platform",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Manufacturing & Agriculture (BigQuery, Vertex AI, Google Earth Engine, IoT sensors)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "iot",
          "label": "Field IoT Sensors",
          "kind": "external"
        },
        {
          "id": "ee",
          "label": "Satellite Imagery",
          "kind": "analytics",
          "tech": "Google Earth Engine",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "weather",
          "label": "Weather Data",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Field Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Field Insights",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "farmer",
          "label": "Farmer",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "iot",
          "to": "bq",
          "label": "soil & field readings"
        },
        {
          "from": "ee",
          "to": "bq",
          "label": "satellite imagery"
        },
        {
          "from": "weather",
          "to": "bq",
          "label": "forecasts"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "multi-layered data"
        },
        {
          "from": "vertex",
          "to": "farmer",
          "label": "irrigation recommendation"
        }
      ]
    }
  },
  {
    "id": "genai-bp-78",
    "title": "#78 \u00b7 Embed on-device AI for frontline worker efficiency",
    "category": "Blueprint #78 \u00b7 Manufacturing & Agriculture",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Manufacturing & Agriculture"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a manufacturer of specialized hardware, like mobile computing devices for retail workers. You want to differentiate your product by providing intelligent, built-in features that help frontline workers make better, faster decisions on the job. (Tech stack: On-device AI models (e.g., Gemini Nano), Vertex AI, a device management platform)",
    "dataflow": [
      "A retail worker scans a shelf with their device",
      "An on-device computer vision model recognizes the products and counts the inventory",
      "The device compares the count to the store's inventory data and identifies a low-stock item",
      "A lightweight, on-device model generates an alert and a suggested action, such as \"Only 2 units of 'Product X' left on the shelf. The backroom has 25. Suggest creating a restocking task.\", empowering the worker to prevent a stockout in the moment"
    ],
    "keywords": [
      "78",
      "blueprint",
      "embed",
      "device",
      "for",
      "frontline",
      "worker",
      "efficiency",
      "manufacturing",
      "agriculture",
      "models",
      "gemini",
      "nano",
      "vertex",
      "management",
      "platform"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #78: Embed on-device AI for frontline worker efficiency using On-device AI models (e.g., Gemini Nano), Vertex AI, a device management platform",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#78 \u00b7 Embed on-device AI for frontline worker efficiency",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Manufacturing & Agriculture (On-device AI models (e.g., Gemini Nano), Vertex AI, a device management platform)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "worker",
          "label": "Retail Worker",
          "kind": "user"
        },
        {
          "id": "device",
          "label": "Device with On-device Models",
          "kind": "mobile",
          "tech": "Gemini Nano (on-device)"
        },
        {
          "id": "inventory",
          "label": "Store Inventory Data",
          "kind": "external"
        },
        {
          "id": "vertex",
          "label": "Model Training",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "mdm",
          "label": "Device Management Platform",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "worker",
          "to": "device",
          "label": "shelf scan"
        },
        {
          "from": "device",
          "to": "inventory",
          "label": "compare counts \u2192 restock alert"
        },
        {
          "from": "vertex",
          "to": "mdm",
          "label": "on-device models"
        },
        {
          "from": "mdm",
          "to": "device",
          "label": "model updates"
        }
      ]
    }
  },
  {
    "id": "genai-bp-79",
    "title": "#79 \u00b7 Forecast energy grid CO2 intensity with AI",
    "category": "Blueprint #79 \u00b7 Energy & Utilities",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Energy & Utilities"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an energy transmission provider committed to sustainability. Your challenge is understanding and predicting the real-time carbon intensity of your electricity grid, which is necessary to optimize the use of renewables and reduce overall emissions. (Tech stack: Vertex AI, BigQuery, Cloud Run)",
    "dataflow": [
      "Real-time data on energy generation from all sources (solar, wind, gas, coal) is streamed into BigQuery",
      "A Vertex AI forecasting model analyzes this data, along with weather forecasts, to predict the CO2 intensity of the grid for the next 24 hours",
      "A service on Cloud Run exposes this forecast via an API",
      "This allows the grid operator to make smarter decisions, like scheduling high-demand industrial processes for times when renewable energy is plentiful and CO2 intensity is lowest"
    ],
    "keywords": [
      "79",
      "blueprint",
      "forecast",
      "energy",
      "grid",
      "co2",
      "intensity",
      "with",
      "utilities",
      "vertex",
      "bigquery",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #79: Forecast energy grid CO2 intensity with AI using Vertex AI, BigQuery, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#79 \u00b7 Forecast energy grid CO2 intensity with AI",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Energy & Utilities (Vertex AI, BigQuery, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "sources",
          "label": "Generation Sources",
          "kind": "external"
        },
        {
          "id": "weather",
          "label": "Weather Forecasts",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Grid Generation Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "CO2 Intensity Forecast",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "run",
          "label": "Forecast API",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "operator",
          "label": "Grid Operator",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "sources",
          "to": "bq",
          "label": "real-time generation"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "history"
        },
        {
          "from": "weather",
          "to": "vertex",
          "label": "forecasts"
        },
        {
          "from": "vertex",
          "to": "run",
          "label": "next 24 hours"
        },
        {
          "from": "operator",
          "to": "run",
          "label": "API calls"
        }
      ]
    }
  },
  {
    "id": "genai-bp-80",
    "title": "#80 \u00b7 Identify and monetize underutilized energy capacity",
    "category": "Blueprint #80 \u00b7 Energy & Utilities",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Energy & Utilities"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an energy services company focused on grid stability and social equity. Your challenge is identifying small pockets of underutilized energy capacity across thousands of commercial buildings that could be aggregated and redirected to benefit communities in need. (Tech stack: Vertex AI, BigQuery, IoT smart meters)",
    "dataflow": [
      "Data from IoT smart meters in commercial buildings is streamed into BigQuery",
      "Vertex AI models analyze the energy consumption patterns of thousands of buildings to identify \"underutilized capacity\"\u2014for example, an office building that consistently uses 20% less power on Friday afternoons",
      "The system aggregates these small, distributed energy \"assets.\"",
      "This aggregated capacity can then be offered to utilities to stabilize the grid or provided as energy credits to low-income households, creating a new, equitable energy economy"
    ],
    "keywords": [
      "80",
      "blueprint",
      "identify",
      "and",
      "monetize",
      "underutilized",
      "energy",
      "capacity",
      "utilities",
      "vertex",
      "bigquery",
      "iot",
      "smart",
      "meters"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #80: Identify and monetize underutilized energy capacity using Vertex AI, BigQuery, IoT smart meters",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#80 \u00b7 Identify and monetize underutilized energy capacity",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Energy & Utilities (Vertex AI, BigQuery, IoT smart meters)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "meters",
          "label": "IoT Smart Meters",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Consumption Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Capacity Analysis",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "aggregation",
          "label": "Capacity Aggregation",
          "kind": "service"
        },
        {
          "id": "utilities",
          "label": "Utilities & Households",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "meters",
          "to": "bq",
          "label": "consumption stream"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "patterns"
        },
        {
          "from": "vertex",
          "to": "aggregation",
          "label": "underutilized capacity"
        },
        {
          "from": "aggregation",
          "to": "utilities",
          "label": "grid capacity & credits"
        }
      ]
    }
  },
  {
    "id": "genai-bp-81",
    "title": "#81 \u00b7 Automate customer onboarding in the energy sector",
    "category": "Blueprint #81 \u00b7 Energy & Utilities",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Energy & Utilities"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an energy company, and signing up new customers is a manual process that involves processing documents like previous utility bills and personal IDs. Your challenge is to automate this workflow to make onboarding faster, reduce fraud, and improve the customer experience. (Tech stack: Document AI, Vertex AI, Cloud Run)",
    "dataflow": [
      "A new customer uploads a photo of their old utility bill and their driver's license to your website",
      "The files are sent to a service on Cloud Run, which uses Document AI to extract structured data from both documents",
      "The service calls a Gemini Flash model with a prompt like, \"Does the name and address on this utility bill match the name and address on this driver's license?\"",
      "Upon receiving a positive confirmation, the system automatically creates the new customer account, completing the onboarding and verification process in seconds"
    ],
    "keywords": [
      "81",
      "blueprint",
      "automate",
      "customer",
      "onboarding",
      "the",
      "energy",
      "sector",
      "utilities",
      "document",
      "vertex",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #81: Automate customer onboarding in the energy sector using Document AI, Vertex AI, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#81 \u00b7 Automate customer onboarding in the energy sector",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Energy & Utilities (Document AI, Vertex AI, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "customer",
          "label": "New Customer",
          "kind": "user"
        },
        {
          "id": "web",
          "label": "Website",
          "kind": "client"
        },
        {
          "id": "run",
          "label": "Onboarding Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "docai",
          "label": "Bill & License Extraction",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Identity Match",
          "kind": "ai",
          "tech": "Gemini Flash on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "accounts",
          "label": "Customer Accounts",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "customer",
          "to": "web",
          "label": "utility bill & license photos"
        },
        {
          "from": "web",
          "to": "run",
          "label": "files"
        },
        {
          "from": "run",
          "to": "docai",
          "label": "structured data"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "do name & address match?"
        },
        {
          "from": "run",
          "to": "accounts",
          "label": "create account"
        }
      ]
    }
  },
  {
    "id": "genai-bp-82",
    "title": "#82 \u00b7 Build a conversational coach for student success",
    "category": "Blueprint #82 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a nonprofit or educational institution focused on helping first-generation students from under-resourced communities succeed in college. Your challenge is providing personalized, scalable coaching that can address each student's unique history and goals without making them feel compared to others. (Tech stack: Vertex AI, BigQuery, a student-facing mobile app)",
    "dataflow": [
      "A student's academic history, goals, and previous interactions are stored in BigQuery",
      "When the student interacts with the AI coach in their app, their query is sent to a service that retrieves their personal context from BigQuery",
      "This history and the student's question are sent to a Gemini model with a prompt like, \"This student is feeling overwhelmed with their chemistry class. Based on their goal of becoming a nurse, provide an encouraging response and suggest two specific campus resources that can help.\"",
      "The AI delivers a personalized, empathetic response, acting as a scalable mentor"
    ],
    "keywords": [
      "82",
      "blueprint",
      "build",
      "conversational",
      "coach",
      "for",
      "student",
      "success",
      "public",
      "sector",
      "education",
      "nonprofits",
      "vertex",
      "bigquery",
      "facing",
      "mobile",
      "app"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #82: Build a conversational coach for student success using Vertex AI, BigQuery, a student-facing mobile app",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#82 \u00b7 Build a conversational coach for student success",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (Vertex AI, BigQuery, a student-facing mobile app)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "student",
          "label": "Student",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Coach App",
          "kind": "mobile"
        },
        {
          "id": "svc",
          "label": "Coach Service",
          "kind": "service",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Student History",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Coaching Response",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "student",
          "to": "app",
          "label": "question"
        },
        {
          "from": "app",
          "to": "svc",
          "label": "query"
        },
        {
          "from": "svc",
          "to": "bq",
          "label": "personal context"
        },
        {
          "from": "svc",
          "to": "gemini",
          "label": "history + question"
        }
      ]
    }
  },
  {
    "id": "genai-bp-83",
    "title": "#83 \u00b7 Create an AI assistant for legal aid and immigration",
    "category": "Blueprint #83 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a legal aid nonprofit. Your challenge is that clients are often overwhelmed by complex legal documents and don't know what their next steps are, while your staff has limited bandwidth to provide one-on-one guidance for every query. (Tech stack: Document AI, Vertex AI, Cloud Run)",
    "dataflow": [
      "An asylum seeker uses their phone to take a picture of a legal letter they received",
      "The image is uploaded to a service on Cloud Run, which sends it to Document AI to extract all the text and key entities like dates and case numbers",
      "The extracted text is then sent to a fine-tuned Gemini model with a prompt like, \"Based on this legal notice, explain what it means in simple terms and list the top 3 most important next steps the recipient should take.\"",
      "The app displays the simplified explanation and actionable guidance, empowering the user to navigate the complex legal process"
    ],
    "keywords": [
      "83",
      "blueprint",
      "create",
      "assistant",
      "for",
      "legal",
      "aid",
      "and",
      "immigration",
      "public",
      "sector",
      "education",
      "nonprofits",
      "document",
      "vertex",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #83: Create an AI assistant for legal aid and immigration using Document AI, Vertex AI, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#83 \u00b7 Create an AI assistant for legal aid and immigration",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (Document AI, Vertex AI, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "user",
          "label": "Asylum Seeker",
          "kind": "user"
        },
        {
          "id": "app",
          "label": "Phone App",
          "kind": "mobile"
        },
        {
          "id": "run",
          "label": "Legal Aid Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "docai",
          "label": "Letter Extraction",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Plain-language Guidance",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "user",
          "to": "app",
          "label": "photo of legal letter"
        },
        {
          "from": "app",
          "to": "run",
          "label": "image"
        },
        {
          "from": "run",
          "to": "docai",
          "label": "text, dates, case numbers"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "explanation & next steps"
        }
      ]
    }
  },
  {
    "id": "genai-bp-84",
    "title": "#84 \u00b7 Develop an SMS chatbot for public benefits applications",
    "category": "Blueprint #84 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a government agency or nonprofit administering a public benefits program like SNAP. Your challenge is that the application process is often complex and confusing, creating a barrier for eligible individuals and families who need assistance. (Tech stack: Vertex AI, SMS API, a benefits eligibility database)",
    "dataflow": [
      "A person sends a text message like \"FOOD\" to a designated number",
      "The SMS API receives the message and forwards it to a Vertex AI Conversation agent",
      "The agent initiates a conversation, asking simple, conversational questions to determine eligibility (e.g., \"How many people are in your household?\" )",
      "Based on the user's responses, the agent checks the eligibility database",
      "The chatbot provides an immediate response, such as \"Based on your answers, you are likely eligible for SNAP benefits. Would you like me to help you start the application?\", turning a multi-day process into minutes"
    ],
    "keywords": [
      "84",
      "blueprint",
      "develop",
      "sms",
      "chatbot",
      "for",
      "public",
      "benefits",
      "applications",
      "sector",
      "education",
      "nonprofits",
      "vertex",
      "api",
      "eligibility",
      "database"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #84: Develop an SMS chatbot for public benefits applications using Vertex AI, SMS API, a benefits eligibility database",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#84 \u00b7 Develop an SMS chatbot for public benefits applications",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (Vertex AI, SMS API, a benefits eligibility database)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "resident",
          "label": "Resident",
          "kind": "user"
        },
        {
          "id": "sms",
          "label": "SMS Gateway",
          "kind": "api",
          "tech": "SMS API"
        },
        {
          "id": "agent",
          "label": "Benefits Agent",
          "kind": "ai",
          "tech": "Vertex AI Conversation",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "db",
          "label": "Eligibility Database",
          "kind": "database"
        }
      ],
      "edges": [
        {
          "from": "resident",
          "to": "sms",
          "label": "text \"FOOD\""
        },
        {
          "from": "sms",
          "to": "agent",
          "label": "message"
        },
        {
          "from": "agent",
          "to": "db",
          "label": "eligibility check"
        }
      ]
    }
  },
  {
    "id": "genai-bp-85",
    "title": "#85 \u00b7 Create a digital case manager to assist social workers",
    "category": "Blueprint #85 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a nonprofit where caseworkers are responsible for large caseloads. Your challenge is that these workers spend dozens of hours per week on administrative tasks like writing action plans and summaries, taking time away from direct, high-impact work with beneficiaries. (Tech stack: Vertex AI, a case management system (e.g., Salesforce), Cloud Functions)",
    "dataflow": [
      "A caseworker finishes a meeting with a beneficiary",
      "The notes from the meeting are saved in their case management system, which triggers a Cloud Function",
      "The function retrieves the new notes along with the beneficiary's entire case history",
      "This information is sent to a Gemini model with a prompt like, \"Based on this beneficiary's history and the notes from today's meeting, draft a detailed action plan for the next 30 days.\"",
      "The AI-generated draft plan is automatically added to the case file, ready for the caseworker to review and approve, saving them hours of writing"
    ],
    "keywords": [
      "85",
      "blueprint",
      "create",
      "digital",
      "case",
      "manager",
      "assist",
      "social",
      "workers",
      "public",
      "sector",
      "education",
      "nonprofits",
      "vertex",
      "management",
      "system",
      "salesforce",
      "cloud",
      "functions"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #85: Create a digital case manager to assist social workers using Vertex AI, a case management system (e.g., Salesforce), Cloud Functions",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#85 \u00b7 Create a digital case manager to assist social workers",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (Vertex AI, a case management system (e.g., Salesforce), Cloud Functions)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "caseworker",
          "label": "Caseworker",
          "kind": "user"
        },
        {
          "id": "cms",
          "label": "Case Management (Salesforce)",
          "kind": "external"
        },
        {
          "id": "fn",
          "label": "Plan Drafting Function",
          "kind": "function",
          "tech": "Cloud Run functions",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Action Plan Drafting",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "caseworker",
          "to": "cms",
          "label": "meeting notes"
        },
        {
          "from": "cms",
          "to": "fn",
          "label": "notes saved",
          "style": "dashed"
        },
        {
          "from": "fn",
          "to": "gemini",
          "label": "history + notes"
        },
        {
          "from": "fn",
          "to": "cms",
          "label": "30-day plan draft",
          "style": "dashed"
        }
      ]
    }
  },
  {
    "id": "genai-bp-86",
    "title": "#86 \u00b7 Accelerate grant writing for nonprofits",
    "category": "Blueprint #86 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a nonprofit that relies on grant funding to operate. Your challenge is that grant writing is a time-consuming, repetitive process that pulls your small team away from delivering on your core mission. (Tech stack: Gemini for Google Workspace)",
    "dataflow": [
      "A grant writer opens a Google Doc using a template for a new grant proposal",
      "The template contains standard sections like \"Organization History,\" \"Mission Statement,\" and \"Program Budget.\"",
      "For a repetitive section, the writer uses the integrated Gemini feature with a prompt like, \"Write a 200-word summary of our organization's mission, based on our website and past proposals.\"",
      "Gemini generates the text, filling in the routine information instantly",
      "This allows the grant writer to focus their time and creativity on the unique, strategic parts of the proposal, cutting grant-writing time"
    ],
    "keywords": [
      "86",
      "blueprint",
      "accelerate",
      "grant",
      "writing",
      "for",
      "nonprofits",
      "public",
      "sector",
      "education",
      "gemini",
      "google",
      "workspace"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #86: Accelerate grant writing for nonprofits using Gemini for Google Workspace",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#86 \u00b7 Accelerate grant writing for nonprofits",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (Gemini for Google Workspace)",
      "groups": [
        {
          "id": "ws",
          "label": "Google Workspace",
          "kind": "boundary"
        }
      ],
      "nodes": [
        {
          "id": "writer",
          "label": "Grant Writer",
          "kind": "user"
        },
        {
          "id": "doc",
          "label": "Proposal Template",
          "kind": "client",
          "tech": "Google Docs",
          "group": "ws"
        },
        {
          "id": "gemini",
          "label": "Gemini in Docs",
          "kind": "ai",
          "tech": "Gemini for Google Workspace",
          "provider": "gcp",
          "group": "ws"
        },
        {
          "id": "sources",
          "label": "Website & Past Proposals",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "writer",
          "to": "doc",
          "label": "opens template"
        },
        {
          "from": "writer",
          "to": "gemini",
          "label": "mission summary prompt"
        },
        {
          "from": "sources",
          "to": "gemini",
          "label": "context"
        },
        {
          "from": "gemini",
          "to": "doc",
          "label": "generated sections"
        }
      ]
    }
  },
  {
    "id": "genai-bp-87",
    "title": "#87 \u00b7 Build a platform to match talent with job opportunities",
    "category": "Blueprint #87 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a government agency or nonprofit focused on workforce development. Your challenge is connecting qualified candidates, especially those from non-traditional backgrounds, with relevant job opportunities in the private sector efficiently and at scale. (Tech stack: Vector Search, BigQuery, Cloud Run)",
    "dataflow": [
      "Job seekers and employers create profiles on the platform, and the data is stored in BigQuery",
      "Candidate skills and job requirements are converted into vector embeddings and indexed in Vector Search",
      "When a new job is posted, the system uses the Vector Search to find the top candidate profiles with the most similar embeddings",
      "For each match, Gemini can be used to generate a personalized pitch, such as \"This candidate seems like a strong fit for your 'Software Engineer' role because their project experience in 'X' aligns with your need for 'Y'.\""
    ],
    "keywords": [
      "87",
      "blueprint",
      "build",
      "platform",
      "match",
      "talent",
      "with",
      "job",
      "opportunities",
      "public",
      "sector",
      "education",
      "nonprofits",
      "vector",
      "search",
      "bigquery",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #87: Build a platform to match talent with job opportunities using Vector Search, BigQuery, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#87 \u00b7 Build a platform to match talent with job opportunities",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (Vector Search, BigQuery, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "users",
          "label": "Job Seekers & Employers",
          "kind": "user"
        },
        {
          "id": "run",
          "label": "Matching Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Profiles & Jobs",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vs",
          "label": "Skill Embeddings",
          "kind": "ai",
          "tech": "Vertex AI Vector Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Match Pitch",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "users",
          "to": "run",
          "label": "profiles & job posts"
        },
        {
          "from": "run",
          "to": "bq",
          "label": "store"
        },
        {
          "from": "bq",
          "to": "vs",
          "label": "embeddings indexed",
          "style": "dashed"
        },
        {
          "from": "run",
          "to": "vs",
          "label": "top candidates"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "personalized pitch"
        }
      ]
    }
  },
  {
    "id": "genai-bp-88",
    "title": "#88 \u00b7 Enhance government transparency with a citizen chatbot",
    "category": "Blueprint #88 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a local government or county office. Your challenge is providing residents with quick and accurate answers to their questions, as your small staff can get overwhelmed with calls, and information on your website can be hard to find. (Tech stack: Vertex AI Search, Cloud Run)",
    "dataflow": [
      "All public county documents, meeting minutes, and website pages are indexed into Vertex AI Search",
      "A resident visits the county website and uses a chatbot to ask, \"When is the next town hall meeting about the new park?\"",
      "The query is sent to a service on Cloud Run, which passes it to Vertex AI Search",
      "The system finds the relevant information from the indexed documents and provides a direct answer with a link to the source",
      "This empowers residents with self-service access to information and frees up county staff"
    ],
    "keywords": [
      "88",
      "blueprint",
      "enhance",
      "government",
      "transparency",
      "with",
      "citizen",
      "chatbot",
      "public",
      "sector",
      "education",
      "nonprofits",
      "vertex",
      "search",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #88: Enhance government transparency with a citizen chatbot using Vertex AI Search, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#88 \u00b7 Enhance government transparency with a citizen chatbot",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (Vertex AI Search, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "docs",
          "label": "County Documents & Pages",
          "kind": "external"
        },
        {
          "id": "search",
          "label": "County Knowledge Search",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "resident",
          "label": "Resident",
          "kind": "user"
        },
        {
          "id": "site",
          "label": "County Website Chatbot",
          "kind": "client"
        },
        {
          "id": "run",
          "label": "Chat Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "docs",
          "to": "search",
          "label": "indexed",
          "style": "dashed"
        },
        {
          "from": "resident",
          "to": "site",
          "label": "question"
        },
        {
          "from": "site",
          "to": "run",
          "label": "query"
        },
        {
          "from": "run",
          "to": "search",
          "label": "query \u2192 answer with source link"
        }
      ]
    }
  },
  {
    "id": "genai-bp-89",
    "title": "#89 \u00b7 Use AI to improve tax collection and auditing",
    "category": "Blueprint #89 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a municipal finance office responsible for tax collection. Your challenge is ensuring that tax classifications on invoices are correct, as manual audits can only cover a tiny fraction of submissions, leading to significant lost revenue from misclassifications. (Tech stack: Document AI, Vertex AI, BigQuery)",
    "dataflow": [
      "When a company submits an invoice, it is automatically processed by Document AI to extract the service descriptions and declared tax category",
      "The extracted data is stored in BigQuery",
      "A Vertex AI classification model, trained on historical data of correct and incorrect classifications, analyzes the service description from the new invoice",
      "If the model predicts a different category than the one declared by the taxpayer (e.g., it classifies a \"consulting\" service as \"software development,\" which has a higher tax rate), the invoice is flagged for human review, improving accuracy and tax collection"
    ],
    "keywords": [
      "89",
      "blueprint",
      "use",
      "improve",
      "tax",
      "collection",
      "and",
      "auditing",
      "public",
      "sector",
      "education",
      "nonprofits",
      "document",
      "vertex",
      "bigquery"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #89: Use AI to improve tax collection and auditing using Document AI, Vertex AI, BigQuery",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#89 \u00b7 Use AI to improve tax collection and auditing",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (Document AI, Vertex AI, BigQuery)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "companies",
          "label": "Companies",
          "kind": "external"
        },
        {
          "id": "docai",
          "label": "Invoice Extraction",
          "kind": "ai",
          "tech": "Document AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Invoice Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Tax Category Classifier",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "auditors",
          "label": "Tax Auditors",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "companies",
          "to": "docai",
          "label": "invoices"
        },
        {
          "from": "docai",
          "to": "bq",
          "label": "descriptions & declared category"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "classify"
        },
        {
          "from": "vertex",
          "to": "auditors",
          "label": "mismatched invoices"
        }
      ]
    }
  },
  {
    "id": "genai-bp-90",
    "title": "#90 \u00b7 Detect and combat misinformation at scale",
    "category": "Blueprint #90 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "security",
    "icon": "security",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a nonprofit fact-checking organization. Your challenge is the sheer volume of new information being published every second, making it impossible for your human fact-checkers to monitor everything and identify which claims need to be addressed most urgently. (Tech stack: Pub/Sub, Vertex AI, Cloud Functions)",
    "dataflow": [
      "A constant stream of content from news sites and social media APIs flows into Pub/Sub",
      "A Cloud Function is triggered for each new piece of content",
      "The content is sent to a Gemini model with a prompt like, \"Analyze this news article. Identify any verifiable claims and check them against our database of known misinformation. Flag any new, rapidly-spreading, or potentially-harmful claims.\"",
      "The system automatically filters out noise and surfaces a prioritized list of new, high-impact claims for human fact-checkers to investigate, allowing them to focus their efforts where it matters most"
    ],
    "keywords": [
      "90",
      "blueprint",
      "detect",
      "and",
      "combat",
      "misinformation",
      "scale",
      "public",
      "sector",
      "education",
      "nonprofits",
      "pub",
      "sub",
      "vertex",
      "cloud",
      "functions"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #90: Detect and combat misinformation at scale using Pub/Sub, Vertex AI, Cloud Functions",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#90 \u00b7 Detect and combat misinformation at scale",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (Pub/Sub, Vertex AI, Cloud Functions)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "sources",
          "label": "News & Social Media APIs",
          "kind": "external"
        },
        {
          "id": "ps",
          "label": "Content Stream",
          "kind": "queue",
          "tech": "Pub/Sub",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "fn",
          "label": "Claim Analysis Function",
          "kind": "function",
          "tech": "Cloud Run functions",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Claim Detection",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "checkers",
          "label": "Fact-checkers",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "sources",
          "to": "ps",
          "label": "content"
        },
        {
          "from": "ps",
          "to": "fn",
          "label": "each item",
          "style": "dashed"
        },
        {
          "from": "fn",
          "to": "gemini",
          "label": "identify & check claims"
        },
        {
          "from": "fn",
          "to": "checkers",
          "label": "prioritized new claims"
        }
      ]
    }
  },
  {
    "id": "genai-bp-91",
    "title": "#91 \u00b7 Accelerate discovery of hidden objects",
    "category": "Blueprint #91 \u00b7 Public Sector, Education & Nonprofits",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Public Sector, Education & Nonprofits"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a scientific institute. Your challenge is finding \"hidden\" objects like asteroids in massive astronomical datasets, a task that is like finding a needle in a haystack for human researchers. (Tech stack: BigQuery, Vertex AI, Google Cloud Storage)",
    "dataflow": [
      "Petabytes of astronomical image data from telescope surveys are stored in Google Cloud Storage and cataloged in BigQuery",
      "A Vertex AI computer vision model is trained to recognize the faint, tell-tale signs of moving objects against the background of stars",
      "The model is run on the entire historical dataset, analyzing images that have already been reviewed by humans",
      "The AI flags potential new asteroid discoveries that were missed by previous methods, which are then presented to astronomers for verification, dramatically accelerating the rate of discovery"
    ],
    "keywords": [
      "91",
      "blueprint",
      "accelerate",
      "discovery",
      "hidden",
      "objects",
      "cross",
      "industry",
      "enterprise",
      "bigquery",
      "vertex",
      "google",
      "cloud",
      "storage"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #91: Accelerate discovery of hidden objects using BigQuery, Vertex AI, Google Cloud Storage",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#91 \u00b7 Accelerate discovery of hidden objects",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Public Sector, Education & Nonprofits (BigQuery, Vertex AI, Google Cloud Storage)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "telescopes",
          "label": "Telescope Surveys",
          "kind": "external"
        },
        {
          "id": "gcs",
          "label": "Survey Images",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Image Catalog",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Moving-object Detection",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "astronomers",
          "label": "Astronomers",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "telescopes",
          "to": "gcs",
          "label": "petabytes of images"
        },
        {
          "from": "gcs",
          "to": "bq",
          "label": "catalog"
        },
        {
          "from": "gcs",
          "to": "vertex",
          "label": "historical images"
        },
        {
          "from": "bq",
          "to": "vertex",
          "label": "reviewed labels"
        },
        {
          "from": "vertex",
          "to": "astronomers",
          "label": "candidate asteroids"
        }
      ]
    }
  },
  {
    "id": "genai-bp-92",
    "title": "#92 \u00b7 Build a personal AI that learns from your data",
    "category": "Blueprint #92 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "customer",
    "icon": "smart_toy",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a technology company aiming to create a truly personal AI assistant. Your challenge is moving beyond generic, one-size-fits-all models to create an AI that is trained exclusively on an individual's own data, facts, and opinions, ensuring privacy and a perfectly tailored experience. (Tech stack: Vertex AI, Google Cloud Storage, Cloud Run)",
    "dataflow": [
      "A user uploads their personal data (documents, emails, notes) to a secure Google Cloud Storage bucket",
      "A fine-tuning job is initiated on Vertex AI, training a baseline Gemini model exclusively on this personal data corpus",
      "The resulting \"personal language model\" is deployed to a secure endpoint on Cloud Run",
      "When the user interacts with their personal AI, their queries are sent only to their own custom model, allowing it to provide responses that reflect their unique knowledge, style, and memory"
    ],
    "keywords": [
      "92",
      "blueprint",
      "build",
      "personal",
      "that",
      "learns",
      "from",
      "your",
      "data",
      "cross",
      "industry",
      "enterprise",
      "vertex",
      "google",
      "cloud",
      "storage",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #92: Build a personal AI that learns from your data using Vertex AI, Google Cloud Storage, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#92 \u00b7 Build a personal AI that learns from your data",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Vertex AI, Google Cloud Storage, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "user",
          "label": "User",
          "kind": "user"
        },
        {
          "id": "gcs",
          "label": "Personal Data Bucket",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "tuning",
          "label": "Fine-tuning Job",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "run",
          "label": "Personal Model Endpoint",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "user",
          "to": "gcs",
          "label": "documents, emails, notes"
        },
        {
          "from": "gcs",
          "to": "tuning",
          "label": "training corpus"
        },
        {
          "from": "tuning",
          "to": "run",
          "label": "personal model"
        },
        {
          "from": "user",
          "to": "run",
          "label": "queries"
        }
      ]
    }
  },
  {
    "id": "genai-bp-93",
    "title": "#93 \u00b7 Create an AI-powered financial planning wizard",
    "category": "Blueprint #93 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a fintech company providing financial planning software for startups. Your challenge is that new users often struggle with the initial setup, which requires connecting disparate data sources and building complex financial models from scratch. (Tech stack: Vertex AI, BigQuery, connections to third-party data source APIs)",
    "dataflow": [
      "A new user signs up and grants access to their financial data sources (e.g., accounting software, bank accounts)",
      "An AI wizard ingests the data into BigQuery",
      "The wizard sends the consolidated data to Gemini with a prompt like, \"Analyze this company's financial data. Identify key revenue streams, cost centers, and growth patterns, then generate a standard three-statement financial model.\"",
      "Gemini generates the baseline model, which is then presented to the user, turning a multi-hour setup process into minutes"
    ],
    "keywords": [
      "93",
      "blueprint",
      "create",
      "powered",
      "financial",
      "planning",
      "wizard",
      "cross",
      "industry",
      "enterprise",
      "vertex",
      "bigquery",
      "connections",
      "third",
      "party",
      "data",
      "source",
      "apis"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #93: Create an AI-powered financial planning wizard using Vertex AI, BigQuery, connections to third-party data source APIs",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#93 \u00b7 Create an AI-powered financial planning wizard",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Vertex AI, BigQuery, connections to third-party data source APIs)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "owner",
          "label": "Business Owner",
          "kind": "user"
        },
        {
          "id": "apis",
          "label": "Accounting & Bank APIs",
          "kind": "external"
        },
        {
          "id": "wizard",
          "label": "Planning Wizard",
          "kind": "service",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Consolidated Financials",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Financial Model Generator",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "owner",
          "to": "wizard",
          "label": "grants access"
        },
        {
          "from": "apis",
          "to": "wizard",
          "label": "financial data"
        },
        {
          "from": "wizard",
          "to": "bq",
          "label": "ingest"
        },
        {
          "from": "wizard",
          "to": "gemini",
          "label": "three-statement model prompt"
        }
      ]
    }
  },
  {
    "id": "genai-bp-94",
    "title": "#94 \u00b7 Develop a sales co-pilot to help B2B sellers",
    "category": "Blueprint #94 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a B2B sales technology company. Your challenge is helping sales representatives navigate complex organizational data to find the right insights to close deals, a process that often involves manually sifting through CRM data, past deals, and product documentation. (Tech stack: Vertex AI, BigQuery, CRM integration)",
    "dataflow": [
      "All of a company's sales data\u2014CRM records, past deals, and product information\u2014is consolidated in BigQuery and indexed into Vertex AI Search",
      "A salesperson preparing for a call uses a co-pilot and asks, \"I'm about to call a prospect in the manufacturing industry. Give me key talking points, relevant case studies, and potential objections.\"",
      "The co-pilot uses Vertex AI Search to find the most relevant information",
      "Gemini synthesizes this data into a concise briefing document, empowering the salesperson to have a more strategic and effective conversation"
    ],
    "keywords": [
      "94",
      "blueprint",
      "develop",
      "sales",
      "pilot",
      "help",
      "b2b",
      "sellers",
      "cross",
      "industry",
      "enterprise",
      "vertex",
      "bigquery",
      "crm",
      "integration"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #94: Develop a sales co-pilot to help B2B sellers using Vertex AI, BigQuery, CRM integration",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#94 \u00b7 Develop a sales co-pilot to help B2B sellers",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Vertex AI, BigQuery, CRM integration)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "crm",
          "label": "CRM & Deal Records",
          "kind": "external"
        },
        {
          "id": "bq",
          "label": "Sales Data",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "search",
          "label": "Sales Knowledge Search",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "seller",
          "label": "Salesperson",
          "kind": "user"
        },
        {
          "id": "copilot",
          "label": "Sales Co-pilot",
          "kind": "client"
        },
        {
          "id": "gemini",
          "label": "Call Briefing",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        }
      ],
      "edges": [
        {
          "from": "crm",
          "to": "bq",
          "label": "CRM integration"
        },
        {
          "from": "bq",
          "to": "search",
          "label": "indexed",
          "style": "dashed"
        },
        {
          "from": "seller",
          "to": "copilot",
          "label": "call prep question"
        },
        {
          "from": "copilot",
          "to": "search",
          "label": "relevant info"
        },
        {
          "from": "copilot",
          "to": "gemini",
          "label": "findings \u2192 briefing"
        }
      ]
    }
  },
  {
    "id": "genai-bp-95",
    "title": "#95 \u00b7 Build an AI agent to transcribe and analyze meetings",
    "category": "Blueprint #95 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a collaboration software company. Valuable information shared in voice conversations and video meetings is often lost or requires hours of manual work to transcribe and summarize for those who couldn't attend. (Tech stack: Speech-to-Text API, Vertex AI, Cloud Run functions)",
    "dataflow": [
      "A user connects the AI agent to their calendar",
      "When a meeting starts, the agent joins the call and records the audio",
      "After the meeting, a Cloud Run function sends the audio file to the Speech-to-Text API for a full transcription",
      "The transcript is then sent to Gemini with a prompt like, \"Summarize this meeting transcript, identify all action items and assign them to the correct person, and list the key decisions that were made.\"",
      "The structured summary and action items are then emailed to all attendees, saving time and improving collaboration"
    ],
    "keywords": [
      "95",
      "blueprint",
      "build",
      "agent",
      "transcribe",
      "and",
      "analyze",
      "meetings",
      "cross",
      "industry",
      "enterprise",
      "speech",
      "text",
      "api",
      "vertex",
      "cloud",
      "run",
      "functions"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #95: Build an AI agent to transcribe and analyze meetings using Speech-to-Text API, Vertex AI, Cloud Run functions",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#95 \u00b7 Build an AI agent to transcribe and analyze meetings",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Speech-to-Text API, Vertex AI, Cloud Run functions)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "user",
          "label": "User",
          "kind": "user"
        },
        {
          "id": "calendar",
          "label": "Calendar",
          "kind": "external"
        },
        {
          "id": "agent",
          "label": "Meeting Agent",
          "kind": "service",
          "group": "gcp"
        },
        {
          "id": "fn",
          "label": "Transcription Function",
          "kind": "function",
          "tech": "Cloud Run functions",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "stt",
          "label": "Transcription",
          "kind": "ai",
          "tech": "Speech-to-Text",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Summary & Action Items",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "email",
          "label": "Attendee Email",
          "kind": "email"
        }
      ],
      "edges": [
        {
          "from": "user",
          "to": "calendar",
          "label": "connects agent"
        },
        {
          "from": "calendar",
          "to": "agent",
          "label": "meeting starts"
        },
        {
          "from": "agent",
          "to": "fn",
          "label": "recorded audio"
        },
        {
          "from": "fn",
          "to": "stt",
          "label": "audio file"
        },
        {
          "from": "fn",
          "to": "gemini",
          "label": "transcript"
        },
        {
          "from": "fn",
          "to": "email",
          "label": "summary & action items"
        }
      ]
    }
  },
  {
    "id": "genai-bp-96",
    "title": "#96 \u00b7 Create an enterprise search engine for workplace knowledge",
    "category": "Blueprint #96 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a company whose employees use dozens of different applications (like Slack, Google Drive, Salesforce, Confluence). Your challenge is that valuable company knowledge is fragmented across these silos, making it nearly impossible for employees to find the information they need to do their jobs effectively. (Tech stack: Vertex AI Search, connectors to various enterprise applications)",
    "dataflow": [
      "Secure connectors are used to index all of a company's data from its various workplace apps into Vertex AI Search, respecting all existing user permissions",
      "An employee uses a single search bar and asks a question like, \"What was our Q3 marketing strategy for the new product launch?\"",
      "Vertex AI Search queries across all connected data sources\u2014finding the strategy document in Google Drive, the related conversations in Slack, and the campaign results in Salesforce",
      "It returns a unified, synthesized answer with links to the original sources, allowing employees to find information"
    ],
    "keywords": [
      "96",
      "blueprint",
      "create",
      "enterprise",
      "search",
      "engine",
      "for",
      "workplace",
      "knowledge",
      "cross",
      "industry",
      "vertex",
      "connectors",
      "various",
      "applications"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #96: Create an enterprise search engine for workplace knowledge using Vertex AI Search, connectors to various enterprise applications",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#96 \u00b7 Create an enterprise search engine for workplace knowledge",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Vertex AI Search, connectors to various enterprise applications)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "apps",
          "label": "Drive, Slack & Salesforce",
          "kind": "external"
        },
        {
          "id": "search",
          "label": "Workplace Search",
          "kind": "ai",
          "tech": "Vertex AI Search",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "employee",
          "label": "Employee",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "apps",
          "to": "search",
          "label": "connectors (permission-aware)",
          "style": "dashed"
        },
        {
          "from": "employee",
          "to": "search",
          "label": "question \u2192 answer with sources"
        }
      ]
    }
  },
  {
    "id": "genai-bp-97",
    "title": "#97 \u00b7 Deploy video intelligence agents for any CCTV camera",
    "category": "Blueprint #97 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "security",
    "icon": "security",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a business with hundreds of CCTV cameras for security. Your challenge is that these cameras generate thousands of hours of passive video footage that is only reviewed after an incident occurs, providing no proactive operational or business insights. (Tech stack: Vertex AI, Cloud Storage, a mobile alerting system)",
    "dataflow": [
      "Live video feeds from CCTV cameras are streamed to Google Cloud Storage",
      "A multimodal Gemini model, acting as a \"video intelligence agent,\" continuously monitors the feeds",
      "The agent is given specific tasks via natural language prompts, such as \"Monitor the store entrance and send an alert if more than 10 people are waiting in line for over 5 minutes,\" or \"Alert security if anyone enters the warehouse after 10 PM.\"",
      "When the AI agent detects a specified event, it automatically sends a real-time alert with a video clip to the relevant personnel's mobile device"
    ],
    "keywords": [
      "97",
      "blueprint",
      "deploy",
      "video",
      "intelligence",
      "agents",
      "for",
      "any",
      "cctv",
      "camera",
      "cross",
      "industry",
      "enterprise",
      "vertex",
      "cloud",
      "storage",
      "mobile",
      "alerting",
      "system"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #97: Deploy video intelligence agents for any CCTV camera using Vertex AI, Cloud Storage, a mobile alerting system",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#97 \u00b7 Deploy video intelligence agents for any CCTV camera",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Vertex AI, Cloud Storage, a mobile alerting system)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "cameras",
          "label": "CCTV Cameras",
          "kind": "external"
        },
        {
          "id": "gcs",
          "label": "Video Feeds",
          "kind": "storage",
          "tech": "Cloud Storage",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Video Intelligence Agent",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "operators",
          "label": "Operators",
          "kind": "user"
        },
        {
          "id": "alerts",
          "label": "Mobile Alerting",
          "kind": "mobile"
        }
      ],
      "edges": [
        {
          "from": "cameras",
          "to": "gcs",
          "label": "live video"
        },
        {
          "from": "gcs",
          "to": "gemini",
          "label": "continuous monitoring"
        },
        {
          "from": "operators",
          "to": "gemini",
          "label": "natural-language tasks"
        },
        {
          "from": "gemini",
          "to": "alerts",
          "label": "alert + clip"
        }
      ]
    }
  },
  {
    "id": "genai-bp-98",
    "title": "#98 \u00b7 Build an agent for B2B workflow automation",
    "category": "Blueprint #98 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "employee",
    "icon": "document_scanner",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a B2B technology company, and you recognize that your clients in different departments (e.g., sales, HR, finance) have unique, complex workflows that are difficult to automate with one-size-fits-all software. (Tech stack: Vertex AI, various third-party API connectors)",
    "dataflow": [
      "A platform provides a framework for building specialized AI agents",
      "A company can create an \"HR Onboarding Agent\" and give it access to their HR systems",
      "When a new employee is hired, the agent automatically executes a multi-step workflow: it creates their user account, assigns required training, and schedules orientation meetings",
      "The agent uses Gemini to orchestrate these tasks by calling the appropriate APIs for each system, automating a complex cross-departmental workflow that would otherwise require significant manual coordination"
    ],
    "keywords": [
      "98",
      "blueprint",
      "build",
      "agent",
      "for",
      "b2b",
      "workflow",
      "automation",
      "cross",
      "industry",
      "enterprise",
      "vertex",
      "various",
      "third",
      "party",
      "api",
      "connectors"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #98: Build an agent for B2B workflow automation using Vertex AI, various third-party API connectors",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#98 \u00b7 Build an agent for B2B workflow automation",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Vertex AI, various third-party API connectors)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "hr",
          "label": "HR System",
          "kind": "external"
        },
        {
          "id": "agent",
          "label": "HR Onboarding Agent",
          "kind": "ai",
          "tech": "Vertex AI Agent Builder",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Task Orchestration",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "identity",
          "label": "Account Provisioning API",
          "kind": "external"
        },
        {
          "id": "training",
          "label": "Training System API",
          "kind": "external"
        },
        {
          "id": "calendar",
          "label": "Calendar API",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "hr",
          "to": "agent",
          "label": "new hire"
        },
        {
          "from": "agent",
          "to": "gemini",
          "label": "plan the steps"
        },
        {
          "from": "agent",
          "to": "identity",
          "label": "create account"
        },
        {
          "from": "agent",
          "to": "training",
          "label": "assign training"
        },
        {
          "from": "agent",
          "to": "calendar",
          "label": "schedule orientation"
        }
      ]
    }
  },
  {
    "id": "genai-bp-99",
    "title": "#99 \u00b7 Transform customer feedback into product insights",
    "category": "Blueprint #99 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "data",
    "icon": "query_stats",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a product development company, and you need to understand how customers feel about your product, but their feedback is scattered across support tickets, app store reviews, and social media. Manually analyzing this unstructured text is a massive challenge. (Tech stack: Vertex AI, BigQuery, data ingestion tools (e.g., Pub/Sub))",
    "dataflow": [
      "All customer feedback streams from various sources into BigQuery",
      "A scheduled job sends batches of new feedback to a Gemini model",
      "The model is given a prompt like, \"Analyze this feedback. Categorize each comment by topic (e.g., 'UI/UX', 'Pricing', 'Bug Report'), determine the sentiment (Positive, Negative, Neutral), and extract any feature requests.\"",
      "The structured, analyzed data is written back to BigQuery",
      "Product managers can now use a simple dashboard to see trends, like \"There was a 30% increase in negative comments about 'login issues' this week,\" allowing them to take data-driven action"
    ],
    "keywords": [
      "99",
      "blueprint",
      "transform",
      "customer",
      "feedback",
      "into",
      "product",
      "insights",
      "cross",
      "industry",
      "enterprise",
      "vertex",
      "bigquery",
      "data",
      "ingestion",
      "tools",
      "pub",
      "sub"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #99: Transform customer feedback into product insights using Vertex AI, BigQuery, data ingestion tools (e.g., Pub/Sub)",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#99 \u00b7 Transform customer feedback into product insights",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Vertex AI, BigQuery, data ingestion tools (e.g., Pub/Sub))",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "sources",
          "label": "Feedback Sources",
          "kind": "external"
        },
        {
          "id": "ps",
          "label": "Feedback Ingestion",
          "kind": "queue",
          "tech": "Pub/Sub",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Feedback Warehouse",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "job",
          "label": "Scheduled Batch Job",
          "kind": "function",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Topic & Sentiment Analysis",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "dash",
          "label": "Trends Dashboard",
          "kind": "client"
        },
        {
          "id": "pms",
          "label": "Product Managers",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "sources",
          "to": "ps",
          "label": "feedback"
        },
        {
          "from": "ps",
          "to": "bq",
          "label": "stream"
        },
        {
          "from": "job",
          "to": "bq",
          "label": "read new feedback, write results"
        },
        {
          "from": "job",
          "to": "gemini",
          "label": "batches"
        },
        {
          "from": "bq",
          "to": "dash",
          "label": "trends"
        },
        {
          "from": "pms",
          "to": "dash",
          "label": "data-driven action"
        }
      ]
    }
  },
  {
    "id": "genai-bp-100",
    "title": "#100 \u00b7 Automate the creative process in marketing campaigns",
    "category": "Blueprint #100 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "creative",
    "icon": "shopping_cart",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're a digital marketing platform, and your clients need to create a high volume of ads for different products and channels. Your challenge is automating the creative process so they can launch effective campaigns without needing a large design team. (Tech stack: Vertex AI, Text-to-Speech API, Cloud Run)",
    "dataflow": [
      "A user provides a few key details about their product and a target audience",
      "This information is sent to a service on Cloud Run, which constructs a prompt for Gemini like, \"Generate three different ad headlines and a short script for a 15-second video ad for a new running shoe targeting marathon runners.\"",
      "Gemini generates the text",
      "The service then sends the script to the Text-to-Speech API to create a voiceover",
      "The text and voiceover are then combined with product images using a template, automatically generating multiple ad variations that are ready to be deployed"
    ],
    "keywords": [
      "blueprint",
      "100",
      "automate",
      "the",
      "creative",
      "process",
      "marketing",
      "campaigns",
      "cross",
      "industry",
      "enterprise",
      "vertex",
      "text",
      "speech",
      "api",
      "cloud",
      "run"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #100: Automate the creative process in marketing campaigns using Vertex AI, Text-to-Speech API, Cloud Run",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#100 \u00b7 Automate the creative process in marketing campaigns",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Vertex AI, Text-to-Speech API, Cloud Run)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "marketer",
          "label": "Marketer",
          "kind": "user"
        },
        {
          "id": "run",
          "label": "Ad Creative Service",
          "kind": "service",
          "tech": "Cloud Run",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "gemini",
          "label": "Headlines & Script",
          "kind": "ai",
          "tech": "Gemini on Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "tts",
          "label": "Voiceover",
          "kind": "ai",
          "tech": "Text-to-Speech",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "templates",
          "label": "Templates & Product Images",
          "kind": "external"
        }
      ],
      "edges": [
        {
          "from": "marketer",
          "to": "run",
          "label": "product & audience"
        },
        {
          "from": "run",
          "to": "gemini",
          "label": "ad prompt"
        },
        {
          "from": "run",
          "to": "tts",
          "label": "script"
        },
        {
          "from": "templates",
          "to": "run",
          "label": "images & templates"
        }
      ]
    }
  },
  {
    "id": "genai-bp-101",
    "title": "#101 \u00b7 Provide an AI observability platform for LLM evaluation",
    "category": "Blueprint #101 \u00b7 Cross-Industry Enterprise AI",
    "agentCategory": "code",
    "icon": "code",
    "industries": [
      "Cross-Industry Enterprise AI"
    ],
    "pillars": [
      "AI & ML Perspective",
      "Performance",
      "Reliability"
    ],
    "summary": "You're an enterprise that is deploying multiple AI applications, but you lack the tools to monitor, troubleshoot, and evaluate their performance in production. Your challenge is ensuring these AI systems are accurate, safe, and effective once they are live. (Tech stack: Google Kubernetes Engine (GKE), BigQuery, Vertex AI)",
    "dataflow": [
      "An enterprise's AI applications send their inputs, outputs, and model telemetry data to an observability platform running on GKE",
      "This data is processed and stored in BigQuery for large-scale analysis",
      "The platform uses Vertex AI models to automatically detect issues like \"model drift\" (when a model's performance degrades over time) or \"hallucinations\" (when an LLM generates incorrect information)",
      "When an issue is detected, the platform sends an alert to the development team via a dashboard, allowing them to quickly diagnose and fix problems with their production AI systems"
    ],
    "keywords": [
      "blueprint",
      "101",
      "provide",
      "observability",
      "platform",
      "for",
      "llm",
      "evaluation",
      "cross",
      "industry",
      "enterprise",
      "google",
      "kubernetes",
      "engine",
      "gke",
      "bigquery",
      "vertex"
    ],
    "prompt": "Google Cloud Gen AI Blueprint #101: Provide an AI observability platform for LLM evaluation using Google Kubernetes Engine (GKE), BigQuery, Vertex AI",
    "diagram": {
      "diagram_type": "architecture",
      "direction": "LR",
      "title": "#101 \u00b7 Provide an AI observability platform for LLM evaluation",
      "subtitle": "Gen AI Technical Blueprint \u00b7 Cross-Industry Enterprise AI (Google Kubernetes Engine (GKE), BigQuery, Vertex AI)",
      "groups": [
        {
          "id": "gcp",
          "label": "Google Cloud",
          "kind": "region"
        }
      ],
      "nodes": [
        {
          "id": "apps",
          "label": "Production AI Apps",
          "kind": "external"
        },
        {
          "id": "gke",
          "label": "Observability Platform",
          "kind": "container",
          "tech": "Google Kubernetes Engine",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "bq",
          "label": "Telemetry Warehouse",
          "kind": "analytics",
          "tech": "BigQuery",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "vertex",
          "label": "Drift & Hallucination Detection",
          "kind": "ai",
          "tech": "Vertex AI",
          "provider": "gcp",
          "group": "gcp"
        },
        {
          "id": "devs",
          "label": "Development Team",
          "kind": "user"
        }
      ],
      "edges": [
        {
          "from": "apps",
          "to": "gke",
          "label": "inputs, outputs, telemetry"
        },
        {
          "from": "gke",
          "to": "bq",
          "label": "store for analysis"
        },
        {
          "from": "gke",
          "to": "vertex",
          "label": "detect issues"
        },
        {
          "from": "gke",
          "to": "devs",
          "label": "alerts on dashboard"
        }
      ]
    }
  }
];
