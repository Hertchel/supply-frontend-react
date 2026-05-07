import { useEffect, useState } from "react";

import Layout from "./components/Layout/SupplyDashboardLayout";

import {
    getRecommendations,
    getAnomalies,
    getForecast
} from "../../../services/aiService";



export default function AIDashboard() {

    const [recommendations, setRecommendations]
        = useState<any[]>([]);

    const [anomalies, setAnomalies]
        = useState<any[]>([]);

    const [forecast, setForecast]
    = useState<any>(null);

    useEffect(() => {

        loadAIData();

    }, []);

    const loadAIData = async () => {

        try {

            const recommendationResponse =
                await getRecommendations();

            const anomalyResponse =
                await getAnomalies();

            const forecastResponse =
                await getForecast();

            console.log(
                "Recommendations:",
                recommendationResponse
            );

            console.log(
                "Anomalies:",
                anomalyResponse
            );

            setRecommendations(
                recommendationResponse
            );

            setAnomalies(
                anomalyResponse
            );

            setForecast(
                forecastResponse
            );

        } catch (error) {

            console.error(
                "AI Dashboard Error:",
                error
            );
        }
    };

    return (

  <Layout>

    <div className="min-h-screen bg-gray-100 p-6">

    <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}

        <div
            className="
                bg-white
                rounded-2xl
                shadow-md
                border-2
                p-6
                flex
                items-center
                justify-between
                flex-wrap
                gap-4
            "
            style={{
                borderColor: "rgb(254 215 170)",
            }}
        >

            <div>

                <h1 className="text-4xl font-bold text-gray-800">
                    AI Procurement Assistant
                </h1>

                <p className="text-gray-500 mt-2">
                    Smart procurement insights, forecasting, and anomaly monitoring
                </p>

            </div>

            <div
                className="
                    px-5
                    py-3
                    rounded-2xl
                    shadow-sm
                "
                style={{
                    backgroundColor: "rgb(254 215 170)",
                }}
            >

                <p className="text-sm text-orange-700 font-medium">
                    AI Powered Procurement Analytics
                </p>

            </div>

        </div>

        {/* FORECASTING */}

        <div
            className="
                bg-white
                rounded-2xl
                shadow-md
                border-2
                p-6
            "
            style={{
                borderColor: "rgb(254 215 170)",
            }}
        >

            <div className="flex items-center justify-between mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-gray-800">
                        AI Demand Forecasting
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                        Predict upcoming procurement demand using historical data
                    </p>

                </div>

            </div>

            {
                forecast && (

                    <div
                        className="
                            rounded-2xl
                            border
                            p-6
                            bg-orange-50
                            grid
                            md:grid-cols-3
                            gap-6
                        "
                    >

                        <div
                            className="
                                bg-white
                                rounded-xl
                                p-5
                                shadow-sm
                                border
                            "
                        >

                            <p className="text-sm text-gray-500 mb-2">
                                Historical Records
                            </p>

                            <h3 className="text-3xl font-bold text-gray-800">
                                {forecast.historical_records}
                            </h3>

                        </div>

                        <div
                            className="
                                bg-white
                                rounded-xl
                                p-5
                                shadow-sm
                                border
                            "
                        >

                            <p className="text-sm text-gray-500 mb-2">
                                Predicted Next Month
                            </p>

                            <h3 className="text-3xl font-bold text-orange-700">
                                {forecast.predicted_next_month_demand}
                            </h3>

                        </div>

                        <div
                            className="
                                bg-white
                                rounded-xl
                                p-5
                                shadow-sm
                                border
                            "
                        >

                            <p className="text-sm text-gray-500 mb-2">
                                Trend
                            </p>

                            <h3 className="text-2xl font-bold text-gray-800">
                                {forecast.trend}
                            </h3>

                        </div>

                    </div>
                )
            }

        </div>

        {/* RECOMMENDATIONS */}

        <div
            className="
                bg-white
                rounded-2xl
                shadow-md
                border-2
                p-6
            "
            style={{
                borderColor: "rgb(254 215 170)",
            }}
        >

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-gray-800">
                    Smart Purchase Recommendations
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                    AI-generated stock replenishment recommendations
                </p>

            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

                {
                    recommendations.map((item, index) => (

                        <div
                            key={index}
                            className="
                                rounded-2xl
                                border
                                p-5
                                bg-orange-50
                                shadow-sm
                                hover:shadow-md
                                transition
                            "
                        >

                            <div className="mb-4">

                                <h3 className="text-xl font-bold text-gray-800">
                                    {item.item}
                                </h3>

                            </div>

                            <div className="space-y-3">

                                <div
                                    className="
                                        bg-white
                                        rounded-xl
                                        p-3
                                        border
                                    "
                                >

                                    <p className="text-sm text-gray-500">
                                        Current Stock
                                    </p>

                                    <p className="font-bold text-lg text-gray-800">
                                        {item.current_stock}
                                    </p>

                                </div>

                                <div
                                    className="
                                        bg-white
                                        rounded-xl
                                        p-3
                                        border
                                    "
                                >

                                    <p className="text-sm text-gray-500">
                                        Recommended Order
                                    </p>

                                    <p className="font-bold text-lg text-orange-700">
                                        {item.recommended_order}
                                    </p>

                                </div>

                            </div>

                        </div>
                    ))
                }

            </div>

        </div>

        {/* ANOMALIES */}

        <div
            className="
                bg-white
                rounded-2xl
                shadow-md
                border-2
                p-6
            "
            style={{
                borderColor: "rgb(254 215 170)",
            }}
        >

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-gray-800">
                    Anomaly Detection
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                    Suspicious or unusual procurement activities detected by AI
                </p>

            </div>

            <div className="grid gap-4">

                {
                    anomalies.map((item, index) => (

                        <div
                            key={index}
                            className="
                                rounded-2xl
                                border
                                p-5
                                bg-red-50
                                flex
                                flex-col
                                md:flex-row
                                md:items-center
                                md:justify-between
                                gap-4
                            "
                        >

                            <div>

                                <h3 className="text-xl font-bold text-red-700">
                                    {item.item}
                                </h3>

                                <p className="text-gray-600 mt-1">
                                    {item.reason}
                                </p>

                            </div>

                            <div
                                className="
                                    px-5
                                    py-3
                                    rounded-xl
                                    bg-white
                                    border
                                    text-center
                                    min-w-[180px]
                                "
                            >

                                <p className="text-sm text-gray-500">
                                    Requested Quantity
                                </p>

                                <p className="text-2xl font-bold text-red-700">
                                    {item.requested_quantity}
                                </p>

                            </div>

                        </div>
                    ))
                }

            </div>

        </div>

    </div>

    </div>

  </Layout>

);
};