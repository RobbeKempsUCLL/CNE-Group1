"use client";

import React, { useState } from 'react';

const BudgetOverview: React.FC = () => {
    const [monthlyIncome, setMonthlyIncome] = useState<number>(3000);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [tempIncome, setTempIncome] = useState<number>(monthlyIncome);
    const [expenses, setExpenses] = useState<{ [key: string]: number }>({});

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setMonthlyIncome(tempIncome);
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setTempIncome(monthlyIncome);
        setIsEditing(false);
    };

    const totalExpenses = Object.values(expenses).reduce((sum, expense) => sum + expense, 0);

    return (
        <div className="p-8 font-sans bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Budget Overview</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">

                {/* Monthly Income Section */}
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-lg font-medium text-gray-700">
                        Monthly Income: {isEditing ? (
                            <input
                                type="number"
                                value={tempIncome}
                                onChange={(e) => setTempIncome(Number(e.target.value))}
                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <span className="text-blue-600 font-semibold">${monthlyIncome}</span>
                        )}
                    </span>
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSaveClick}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancelClick}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleEditClick}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                            Edit
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    {['Housing', 'Food', 'Bills', 'Other'].map((category) => (
                        <div key={category} className="flex items-center gap-4">
                            <span className="text-lg font-medium text-gray-700">{category}:</span>
                            <input
                                type="number"
                                value={expenses[category] || 0}
                                onChange={(e) => setExpenses({
                                    ...expenses,
                                    [category]: Number(e.target.value),
                                })}
                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => setExpenses({
                                    ...expenses,
                                    [category]: (expenses[category] || 0) + 1,
                                })}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                Add Expense
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-6">
                  <h2 className="text-lg font-medium text-gray-700">Total:</h2>
                </div>
                <div className="mt-6 text-lg font-medium">
                    Total Expenses:{' '}
                    <span
                        className={`${totalExpenses > monthlyIncome ? 'text-red-500' : 'text-gray-700'}`}
                    >
                        ${totalExpenses}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BudgetOverview;
