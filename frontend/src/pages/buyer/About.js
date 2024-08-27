// pages/buyer/About.js

import React from 'react';
import BackBtn from './menuComp/backBtn';

const About = () => {
  return (
  <div className="flex flex-col items-center justify-center">
    <BackBtn/>
    <div className='flex flex-col justify-center items-center border-2 rounded-2xl border-black bg-gray-400 w-1/2 p-4 m-8'>
      <div className="text-red-600 text-3xl font-bold text-center m-2">
        About us
      </div>
      
      <div className="m-1">
        <p>Since our modest beginnings in 2005 with a little space in Toronto’s stylish Yorkville locale, ‘GoodFood’ development has been enlivened with the energy to cook and serve solid, Indian-roused takeout food.</p>
        <p>In contrast to other Indian eateries, ‘GoodFood’  was made with the explicit expectation to appear as something else.</p>
        <p>We realize numerous individuals love Indian sustenance, yet a large number of them loathe or are unconscious of the regularly unfortunate fixings that make run-of-the-mill Indian nourishment taste so great.</p>
        <p>Our menu highlights things that utilize the sound and fragrant flavors, however, forget the stuffing ghee, spread, oil, and overwhelming cream.</p>
        <p>‘GoodFood’ has developed to incorporate four superb takeout areas in Toronto, with additional to come sooner rather than later. Our group takes pride in the way that we can furnish our new and faithful clients with extraordinary tasting Indian-roused nourishment that is not normal for that some other Indian eateries you visit.</p>
        <p>We perceive that a few people are as yet searching for run-of-the-mill Indian nourishment, and that is fine with us. Our disclaimer is that on the off chance that you’re anticipating overwhelming, slick, undesirable Indian nourishment, ‘GoodFood’ isn’t the place for you.</p>
        <p>Our expectation is that you’ll join the developing pattern that such a large number of others have officially found and you will attempt ‘GoodFood’ as a remarkable option to other Indian eateries as well as to all other solid sustenance alternatives out there!</p>
        <div className="font-medium">
        <p>Feel free to reach out to us at our email:  lovely1211zmn@gmail.com</p>
        <p>We are always here to help you find the perfect dish.</p>
        </div>
        <div className='my-2 font-bold text-center'>Thank You for Visit</div>
      </div> 
    </div>
  </div>
  
)};

export default About;
