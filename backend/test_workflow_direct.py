import asyncio
from dotenv import load_dotenv
from app.runtime import run_workflow, configure_gemini
from app.schemas import OrchestrateRequest, UserLocation

load_dotenv()

# Configure the agents client using the environment variables
configure_gemini()

async def main():
    print("--- RUNNING AGENTIC PIPELINE DIRECTLY ---")
    req = OrchestrateRequest(
        user_prompt="I need a plumber to fix a leaking pipe in sector G-13 as soon as possible",
        user_location=UserLocation(
            sector="G-13",
            city="Islamabad"
        )
    )
    
    try:
        response = await run_workflow(req)
        print("\n--- WORKFLOW EXECUTION COMPLETE ---")
        print(f"Service Category: {response.intent.service_type}")
        print(f"Assigned Area:    {response.intent.location}")
        print(f"Recommended:      {response.recommended.name}")
        print(f"Booking Status:   {response.booking.message}")
        print(f"Followup Action:  {response.followup.message}")
    except Exception as e:
        print("\n❌ WORKFLOW FAILED!")
        print("Error details:", e)

if __name__ == "__main__":
    asyncio.run(main())
