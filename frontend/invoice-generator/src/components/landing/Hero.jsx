import React from 'react'
import { Link } from 'react-router-dom'
import HERO_IMG from '../../assets/HERO_IMG.png'
import { useAuth } from '../../context/authContext';

const Hero = () => {
    const {isAuthenticated} = useAuth();

    return (
        <section className='relative bg-[#fbfbfb] overflow-hidden min-h-screen flex items-center'>
            <div className='absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]'></div>

            <div className='relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-24 lg:py-36 w-full'>

                {/* Text block */}
                <div className='text-center max-w-3xl mx-auto mb-14'>
                    <h1 className='text-3xl sm:text-3xl lg:text-6xl font-extrabold text-blue-950 leading-tight mb-6'>
                        AI-Powered Invoicing, Made Effortless
                    </h1>
                    <p className='text-base sm:text-xl text-gray-700 mb-10 leading-relaxed'>
                        Let our AI create invoices from simple texts, generate payment reminders and more.
                    </p>

                    {/* Buttons */}
                    <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                        {isAuthenticated ? (
                            <Link
                                to='/dashboard'
                                className='bg-gradient-to-r from-blue-950 to-blue-900 text-white px-8 py-3.5 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-900 transition-all duration-200 hover:scale-105 hover:shadow-2xl'
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link
                                to='/signup'
                                className='bg-gradient-to-r from-blue-950 to-blue-900 text-white px-8 py-3.5 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-900 transition-all duration-200 hover:scale-105 hover:shadow-2xl'
                            >
                                Get Started for Free
                            </Link>
                        )}

                        <a href='#features'
                            className='border-2 border-black text-black px-8 py-3.5 rounded-xl font-bold text-base sm:text-lg hover:bg-white hover:text-black transition-all duration-200 hover:scale-105'
                        >
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Hero image */}
                <div className='mt-10 sm:mt-15 max-w-4xl mx-auto px-2 sm:px-0'>
                    <img
                        src={HERO_IMG}
                        alt='Invoice-App Screenshot'
                        className='w-full rounded-2xl shadow-2xl shadow-gray-300 border-4 border-gray-200'
                    />
                </div>

            </div>
        </section>
    )
}

export default Hero