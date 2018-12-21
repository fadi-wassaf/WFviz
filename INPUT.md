# WFViz

##### By Fadi Wassaf

This is WFViz, a web applet that can display various wavefunctions while allowing the user to update different variables in real time using three.js. Currently, the supported wavefunctions are:

- Particle in a 1D infinite potential well
- Particle trapped in a 3D Box
- Hydrogen model

Below I will go through the process used to find these wavefunctions and how they are visualized in the program.

### Particle in a 1D Infinite Potential Well

The wavefunctions used are found using the time independent Schrödinger Equation which in it's simplest form is defined as:
$$
\hat H\psi= E\psi
$$
Finding the wavefunction for the particle in a 1D infinite potential well is the simplest. For our particle the following boundary conditions apply:

- Inside the box ( $0 < x < L$ ), the potential energy $U(x)$ is zero
- At the walls of the box ( $x<0 \; or \; x>L$ )  $U(x) = \infin$

Next we can expand out the Hamiltonian operator in the Schrödinger Equation:
$$
-\frac{\hbar^2}{2m}\frac{d^2}{dx^2}\psi(x) + U(x)\psi(x) = E\psi(x)
$$
Given that the potential for the particle will be zero inside the box, the equation simplifies to:
$$
-\frac{\hbar^2}{2m}\frac{d^2}{dx^2}\psi(x) = E\psi(x)
$$
This equation has a general solution of $\psi(x) = A\sin(kx) + B\cos(kx)$. To fulfill our boundary conditions, B must be zero so our wavefunction for this system will be in the form $\psi(x) = A\sin(kx)$. Solving the differential equation when using this form gives the following solutions:
$$
\psi(x) = A\sin\left(\frac{n\pi x}{L}\right) \; for \; n = 1,2,3...
$$
The process to find the coefficient $A$, consists of normalizing the wavefunction above. It is known that the sum of all probabilities in the well must be equal to 1 or:
$$
\int_0^L |\psi(x)|^2 dx = 1
$$
Solving the above integral gives us a value for A which gives the form of the wavefunction and probability density that is graphed in the web applet:
$$
\psi(x) = \sqrt{\frac{2}{L}}\sin\left(\frac{n\pi x}{L}\right) \; for \; n = 1,2,3...
$$

This wavefunction and it's corresponding probability density can simply be graphed as functions on the three.js canvas.

### Particle in a 3D Box

For a particle in a 3D box, we use similar boundary conditions to the 1D infinite potential well. This time however, the position of the particle will be bounded between $0 < x, y, z < L$. This time our wavefunction will depend on three variables so the Schrödinger Equation becomes:
$$
-\frac{\hbar^2}{2m}\nabla^2 \psi(x,y,z) + U(x,y,z)\psi(x,y,z) = E\psi(x,y,z)
$$
Let's define $\vec{r}$ to be our position vector. Once again our potential energy inside the box is zero, so our resulting differential equation is:
$$
-\frac{\hbar^2}{2m}\left(\frac{\partial^2}{\partial x^2}\psi(\vec{r}) + \frac{\partial^2}{\partial y^2}\psi(\vec{r}) + \frac{\partial^2}{\partial z^2}\psi(\vec{r})\right) = E\psi(\vec{r})
$$
Separation of variables allows solving this differential equation by making the wavefunction a product of three functions for the independent variables. This function would be $\psi(\vec{r}) = X(x)Y(y)Z(z)$. Splitting the above equation into three parts, solving and normalizing we see that in each dimension, the wavefunction is identical to the wavefunction of the 1D infinite potential well.
$$
X(x) = \sqrt{\frac{2}{L_x}}\sin\left(\frac{n_x\pi x}{L_x}\right) \; for \; n_x = 1,2,3... \\
Y(y) = \sqrt{\frac{2}{L_y}}\sin\left(\frac{n_y\pi y}{L_y}\right) \; for \; n_y = 1,2,3... \\
Z(z) = \sqrt{\frac{2}{L_z}}\sin\left(\frac{n_z\pi y}{L_z}\right) \; for \; n_z = 1,2,3... 
$$
