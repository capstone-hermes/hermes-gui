import { useState, useEffect } from "react";
import UrlInput from "../components/UrlInput";
import TestList from "../components/TestList";
import { runScan } from "../service/api.service";
import { toast } from "react-hot-toast";
import { csvToJson } from "../lib/csvToJson";
import { FiAlertCircle, FiCheckCircle, FiCircle } from "react-icons/fi";

// Définition de l'interface pour un résultat de scan (finding)
interface Finding {
  id: string;
  chapter: string;
  section?: string;
  description: string;
  url?: string;
}

// Définition de l'interface pour la réponse du scan
interface ScanResponse {
  data: {
    url: string;
    timestamp: string;
    findings: Finding[];
  };
}

// Interface pour les données ASVS
interface ASVSData {
  chapter_id: string;
  chapter_name: string;
  section_id: string;
  section_name: string;
  req_id: string;
  req_description: string;
  level1: string;
  level2: string;
  level3: string;
  cwe: string;
  nist?: string;
}

const Home = () => {
  // State pour stocker la liste des tests (résultats)
  const [tests, setTests] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      status: "pending" | "running" | "completed" | "failed";
      url?: string;
      section?: string;
    }>
  >([]);

  const [asvsData, setAsvsData] = useState<ASVSData[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [checkedAsvs, setCheckedAsvs] = useState<Record<string, boolean>>({});

  const toggleCheck = (reqId: string) => {
    setCheckedAsvs(prev => ({ ...prev, [reqId]: !prev[reqId] }));
};

  useEffect(() => {
    const loadCsvData = async () => {
      try {
        const data = await csvToJson("/ASVS.csv");
        setAsvsData(data);
      } catch (error) {
        console.error("Erreur lors du chargement des données ASVS :", error);
      }
    };

    loadCsvData();
  }, []);

    const [showOwasp, setShowOwasp] = useState(window.innerWidth >= 1024);

    useEffect(() => {
    const handleResize = () => {
      setShowOwasp(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleChapter = (chapter: string) => {
    setExpandedChapter(expandedChapter === chapter ? null : chapter);
  };

  const groupedData = groupByChapter(asvsData);

  // State pour gérer l'état de l'analyse (scan)
  const [isScanning, setIsScanning] = useState(false);

  // Fonction appelée lors de la soumission d'une URL
  const handleUrlSubmit = async (url: string) => {
    console.log(`Analyse démarrée pour ${url}...`);
    // Réinitialisation des tests et de l'état de scan avant le début de l'analyse
    setTests([]);
    setIsScanning(false);

    // Affichage d'un toast de chargement
    const toastId = toast.loading(`Analyse de ${url} en cours...`, {
      position: "bottom-center",
      style: {
        backgroundColor: "#2A2E3B",
        color: "white",
        border: "2px solid #00FF9C",
      },
    });

    try {
      // Appel de l'API de scan
      const response = (await runScan(url)) as ScanResponse;
      console.log("Réponse du scanner : ", response);

      // Récupération des données de la réponse
      const { data } = response;
      const { findings, url: scannedUrl, timestamp } = data;

      // Formatage de la date du scan pour affichage
      const scanTime = new Date(timestamp).toLocaleString();

      // Création d'un tableau de tests à partir des findings
      const newTests = findings.map((finding) => ({
        id: finding.id,
        name: `${finding.id} - ${finding.chapter}`,
        description: finding.description,
        section: finding.section,
        url: finding.url,
        status: "completed" as const,
      }));

      // Si aucun finding n'est trouvé, on ajoute un test par défaut
      if (newTests.length === 0) {
        newTests.push({
          id: "0",
          name: "Scan Complete",
          description: "No vulnerabilities were found in the scan",
          section: undefined,
          url: undefined,
          status: "completed" as const,
        });
      }

      // Mise à jour du state avec les nouveaux tests
      setTests(newTests);
      // Passage de l'état de scan à true pour afficher les résultats
      setIsScanning(true);

      // Affichage d'un toast de succès avec les informations du scan
      toast.success(`Scan completed for ${scannedUrl} at ${scanTime}`, {
        position: "bottom-center",
        id: toastId,
        style: {
          backgroundColor: "#2A2E3B",
          color: "white",
          border: "2px solid #00FF9C",
        },
      });
    } catch (error) {
      // Gestion de l'erreur lors de l'analyse
      console.error("Erreur lors de l'analyse :", error);
      setIsScanning(false);
      // Affichage d'un toast d'erreur
      toast.error("Error: Unable to complete the scan", {
        position: "bottom-center",
        id: toastId,
        style: {
          backgroundColor: "#2A2E3B",
          color: "white",
          border: "2px solid #FF1F00",
        },
      });
    }
  };

  // Fonction pour basculer le statut d'un test entre "completed" et "pending"
  const handleStatusChange = (
    id: string,
    currentStatus: "pending" | "running" | "completed" | "failed"
  ) => {
    // Si le statut actuel est "completed", le passer à "pending", sinon à "completed"
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    // Mise à jour du state en modifiant uniquement le test concerné
    setTests((prevTests) =>
      prevTests.map((test) =>
        test.id === id ? { ...test, status: newStatus } : test
      )
    );
  };

return (
  <div className="min-h-screen bg-cyber-black p-8 relative">
    {/* Panneau gauche fixe "How does it work?" */}
    <div className="hidden md:block fixed left-10 top-10 w-64 bg-cyber-gray/50 p-4 rounded shadow-lg">
      <h2 className="text-white text-xl font-bold mb-2">How does it work?</h2>
      <p className="text-gray-400 text-sm">
        This site analyzes the security of a URL. Enter a URL to start the scan and view the results.
        You can also check all the vulnerabilities from the OWASP list and test them on the site below.
      </p>
      <div className="mt-2 flex gap-2">
        <a
          href="https://github.com/capstone-hermes/hermes-fullstack/wiki"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="px-3 py-1 bg-cyber-gray hover:bg-cyber-black text-cyber-green rounded transition text-sm">
            Documentation
          </button>
        </a>
        <a
          href="http://localhost:80"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="px-3 py-1 bg-cyber-gray hover:bg-cyber-black text-cyber-green rounded transition text-sm">
            Website
          </button>
        </a>
      </div>
    </div>
    
    {/* Nouveau panneau gauche "Who we are?" */}
    <div className="hidden md:block fixed left-10 bottom-10 w-64 bg-cyber-gray/50 p-4 rounded shadow-lg">
      <h2 className="text-white text-xl font-bold mb-2">Who we are?</h2>
      <p className="text-gray-400 text-sm">
        We are a team of passionate Epitech students working on our final-year capstone project, focused on cybersecurity and ethical hacking. This tool was built by learners, for learners — to make web security more accessible, educational, and hands-on.
      </p>
      <a
        href="https://github.com/capstone-hermes"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="mt-2 px-3 py-1 bg-cyber-gray hover:bg-cyber-black text-cyber-green rounded transition text-sm">
          GitHub
        </button>
      </a>
    </div>
    
    {/* Contenu central */}
    <div className="flex max-w-6xl mx-auto h-[calc(100vh-32px)] justify-center">
      <div className="flex-1 flex flex-col mx-4">
        <header className="text-center mb-4">
          <img
            src="../../public/logo.png"
            alt="Logo"
            className="mx-auto mb-4 w-96 rounded-lg shadow-lg"
          />
          <p className="text-white">
            Security analysis tool for junior pentesters
          </p>
        </header>
        <main className="flex-grow overflow-y-auto scrollbar-hide p-8 pb-8">
          <UrlInput onSubmit={handleUrlSubmit} />
          {tests.length > 0 ? (
            <TestList tests={tests} onStatusChange={handleStatusChange} />
          ) : (
            <div className="flex flex-col items-center justify-center mt-32 text-gray-400">
              <FiAlertCircle className="text-6xl mb-4 text-cyber-green" />
              <p className="text-lg font-medium">No scan processed</p>
            </div>
          )}
        </main>
      </div>
    </div>
    
    {/* Panneau droit : Liste OWASP */}
    {showOwasp && (
      <aside className="fixed top-4 right-4 w-80 h-screen bg-cyber-gray/50 text-white shadow-lg rounded">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">OWASP List</h2>
        </div>
        <div
          className="p-4 overflow-y-auto scrollbar-hide"
          style={{ height: "calc(100vh - 68px)" }}
        >
          {Object.keys(groupedData).length > 0 ? (
            Object.entries(groupedData).map(([chapterName, items]) => {
              // Grouper les items par section_name dans ce chapitre
              const groupBySection = items.reduce((acc, item) => {
                const key = item.section_name || "Autres";
                if (!acc[key]) {
                  acc[key] = [];
                }
                acc[key].push(item);
                return acc;
              }, {} as Record<string, ASVSData[]>);
              return (
                <details key={chapterName} className="mb-4">
                  <summary className="cursor-pointer text-left text-cyber-green font-bold bg-cyber-green/20 px-4 py-2 rounded hover:bg-gray-600 transition">
                    {items[0].chapter_id} - {chapterName}
                  </summary>
                  <div className="mt-2 pl-4">
                    {Object.entries(groupBySection).map(([sectionName, sectionItems]) => (
                      <details key={sectionName} className="mb-4">
                        <summary className="cursor-pointer text-left text-cyber-green font-bold hover:bg-cyber-black text-cyber-green px-3 py-1 rounded transition">
                          {sectionName}
                        </summary>
                        <div className="mt-2 pl-4">
                          {sectionItems.map((item, index) => (
                            <div key={index} className="mb-4 bg-cyber-black border border-cyber-green p-3 rounded flex items-center justify-between">
                              <div>
                                <h4 className="text-gray-300 font-semibold">{item.req_id}</h4>
                                <p className="text-gray-400">{item.req_description}</p>
                              </div>
                            <div onClick={() => toggleCheck(item.req_id)} className="cursor-pointer">
                              {checkedAsvs[item.req_id] ? (
                                <FiCheckCircle className="text-cyber-green" size={20} />
                              ) : (
                                <FiCircle className="text-cyber-green" size={20} />
                              )}
                            </div>
                        </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              );
            })
          ) : (
            <p>Loading data...</p>
          )}
        </div>
      </aside>
    )}   
    {tests.length === 0 && (
      <footer className="fixed bottom-0 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm p-4">
        Powered by Hermes Team • Licence MIT
      </footer>
    )}
  </div>
);
}

const groupByChapter = (data: ASVSData[]) => {
  return data.reduce((acc, item) => {
    if (!acc[item.chapter_name]) {
      acc[item.chapter_name] = [];
    }
    acc[item.chapter_name].push(item);
    return acc;
  }, {} as Record<string, ASVSData[]>);
};

export default Home;
