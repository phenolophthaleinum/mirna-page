# CMC: Cancer miRNA Census

## Installation
1. **Clone the repository.** Run the following command in your terminal:

```
git clone https://github.com/phenolophthaleinum/mirna-page.git
```

2. **Navigate to the project directory.**

```
cd mirna-page
```

3. Check Python version. This page should for at least for Python 3.8.8.

```
python
```
Command above should open python console and return the following:

```
Python 3.10.12 (main, Jun 11 2023, 05:26:28) [GCC 11.4.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```
Version may vary.

4. **Create a virtual environment.** It's a good practice to create a virtual environment for your Python projects. You can create one using the following command:

```
python -m venv mirna-venv
```
This will create a new virtual environment named mirna-venv.

5. **Activate the virtual environment.** Before you can start installing the project dependencies, you need to activate the virtual environment. The command to do this depends on your operating system:

On Windows, run: 

```
.\mirna-venv\Scripts\activate
```

On Linux or MacOS, run: 
```
source mirna-venv/bin/activate
```

> **Note**
> To open page, you need to activate your environment first.

6. **Install dependencies.** 

```
pip install -r requirements.txt
```   

> **Note**
> This may take several minutes.

7. **Run page:**

```
python page.py
```

The command should return the following

```
 * Serving Flask app 'page'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 395-978-123
```

Click the link (http://127.0.0.1:5000) while holding <kbd>Ctrl</kbd> to open page in the browser.
